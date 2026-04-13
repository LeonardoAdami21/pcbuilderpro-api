import { Injectable } from '@nestjs/common';
import { PcBuilderRepository } from './repository/pc-builder.repository';
import { ComponentType } from '@prisma/client';
import { CompatibilityIssue } from './interface/IPcBuilder.interface';

@Injectable()
export class PcBuilderService {
  constructor(private readonly pcBuilderRepository: PcBuilderRepository) {}

  async getComponentsByType(type: ComponentType, query?: string) {
    const components = await this.pcBuilderRepository.getComponentsByType(
      type,
      query,
    );

    return components;
  }

  // ── Verificar compatibilidade entre componentes ────────────
  async checkCompatibility(productIds: string[]): Promise<{
    compatible: boolean;
    issues: CompatibilityIssue[];
    warnings: CompatibilityIssue[];
  }> {
    const { compatible, issues, warnings } =
      await this.pcBuilderRepository.checkCompatibility(productIds);

    return { compatible, issues, warnings };
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
    const build = await this.pcBuilderRepository.saveBuild(dto);
    return build;
  }

  // ── Listar builds públicos ────────────────────────────────
  async getPublicBuilds(limit = 10) {
    const builds = await this.pcBuilderRepository.getPublicBuilds(limit);
    return builds;
  }
}
