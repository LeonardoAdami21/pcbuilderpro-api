import { Injectable } from '@nestjs/common';
import { ComponentType } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CompatibilityIssue } from '../interface/IPcBuilder.interface';

@Injectable()
export class PcBuilderRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Listar componentes por tipo ────────────────────────────
  async getComponentsByType(type: ComponentType, query?: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        stock: { gt: 0 },
        // Match pelo tipo: a categoria deve conter o nome do tipo
        category: {
          name: {
            contains: this.componentTypeLabel(type),
            mode: 'insensitive',
          },
        },
        ...(query && {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        attributes: true,
      },
      orderBy: { price: 'asc' },
    });
  }

  // ── Verificar compatibilidade entre componentes ────────────
  async checkCompatibility(productIds: string[]): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: CompatibilityIssue[];
  }> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { attributes: true },
    });

    const issues: CompatibilityIssue[] = [];
    const warnings: CompatibilityIssue[] = [];

    // Busca incompatibilidades cadastradas no banco
    for (const product of products) {
      const incompatibilities = await this.prisma.productCompatibility.findMany(
        {
          where: {
            productId: product.id,
            compatibleWithId: {
              in: productIds.filter((id) => id !== product.id),
            },
            isCompatible: false,
          },
          include: { compatibleWith: { select: { name: true } } },
        },
      );

      incompatibilities.forEach((inc) => {
        issues.push({
          severity: 'error',
          message:
            inc.reason ||
            `${product.name} é incompatível com ${inc.compatibleWith.name}`,
          componentA: product.id,
          componentB: inc.compatibleWithId,
        });
      });
    }

    // Verificações automáticas por atributos
    const attrMap = this.buildAttrMap(products);

    // Regra: CPU e Placa-mãe devem ter mesmo socket
    const cpuSocket = attrMap['CPU']?.Socket || attrMap['CPU']?.['Soquete'];
    const mbSocket =
      attrMap['MOTHERBOARD']?.Socket || attrMap['MOTHERBOARD']?.['Soquete'];
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push({
        severity: 'error',
        message: `Socket incompatível: CPU usa ${cpuSocket}, placa-mãe usa ${mbSocket}`,
      });
    }

    // Regra: RAM deve ser compatível com a placa-mãe (DDR4 vs DDR5)
    const ramType = attrMap['RAM']?.Tipo || attrMap['RAM']?.['Tipo de memória'];
    const mbRamType =
      attrMap['MOTHERBOARD']?.['Tipo de memória'] ||
      attrMap['MOTHERBOARD']?.RAM;
    if (ramType && mbRamType && !mbRamType.includes(ramType)) {
      issues.push({
        severity: 'error',
        message: `Memória incompatível: RAM é ${ramType}, placa-mãe suporta ${mbRamType}`,
      });
    }

    // Aviso: PSU pode ser insuficiente
    const psuWatts = this.parseWatts(attrMap['PSU']?.Potência);
    const gpuTdp = this.parseWatts(attrMap['GPU']?.TDP);
    const cpuTdp = this.parseWatts(attrMap['CPU']?.TDP);
    if (psuWatts && (gpuTdp || cpuTdp)) {
      const estimatedConsumption = (gpuTdp || 0) + (cpuTdp || 0) + 100; // +100W para o resto
      if (psuWatts < estimatedConsumption * 1.2) {
        warnings.push({
          severity: 'warning',
          message: `Fonte de ${psuWatts}W pode ser insuficiente. Consumo estimado: ${estimatedConsumption}W. Recomendamos ao menos ${Math.ceil((estimatedConsumption * 1.2) / 50) * 50}W`,
        });
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      warnings,
    };
  }

  // ── Salvar build ──────────────────────────────────────────
  async saveBuild(dto: {
    name: string;
    description?: string;
    isPublic?: boolean;
    slots: {
      componentType: ComponentType;
      productId: string;
      quantity?: number;
    }[];
  }) {
    // Calcula o preço total
    const productIds = dto.slots.map((s) => s.productId).filter(Boolean);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    const priceMap = Object.fromEntries(
      products.map((p) => [p.id, Number(p.price)]),
    );
    const totalPrice = dto.slots.reduce((sum, slot) => {
      return sum + (priceMap[slot.productId] || 0) * (slot.quantity || 1);
    }, 0);

    return this.prisma.pcBuild.create({
      data: {
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
        totalPrice,
        slots: {
          create: dto.slots.map((s) => ({
            componentType: s.componentType,
            productId: s.productId,
            quantity: s.quantity ?? 1,
          })),
        },
      },
      include: {
        slots: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });
  }

  // ── Listar builds públicos ────────────────────────────────
  async getPublicBuilds(limit = 12) {
    return this.prisma.pcBuild.findMany({
      where: { isPublic: true },
      include: {
        slots: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  private buildAttrMap(products: any[]) {
    const map: Record<string, Record<string, string>> = {};
    products.forEach((p) => {
      // Usa a categoria para identificar o tipo de componente
      const type = p.category?.name?.toUpperCase() || 'UNKNOWN';
      if (!map[type]) map[type] = {};
      p.attributes.forEach((a: any) => {
        map[type][a.key] = a.value;
      });
    });
    return map;
  }

  private parseWatts(value?: string): number | null {
    if (!value) return null;
    const match = value.match(/(\d+)\s*[Ww]/);
    return match ? parseInt(match[1]) : null;
  }

  private componentTypeLabel(type: ComponentType): string {
    const labels: Record<ComponentType, string> = {
      CPU: 'Processador',
      MOTHERBOARD: 'Placa-mãe',
      RAM: 'Memória',
      GPU: 'Placa de Vídeo',
      STORAGE: 'SSD',
      PSU: 'Fonte',
      CASE: 'Gabinete',
      COOLER: 'Cooler',
      FAN: 'Fan',
    };
    return labels[type] || type;
  }
}
