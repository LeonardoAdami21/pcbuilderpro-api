import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class CompareRepository {
  private readonly MAX_ITEMS = 4; // máximo de produtos para comparar

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Compara múltiplos produtos lado a lado.
   * Normaliza os atributos para exibição em tabela.
   */
  async compareProducts(productIds: string[]) {
    if (productIds.length < 2) {
      throw new BadRequestException(
        'Informe ao menos 2 produtos para comparar',
      );
    }
    if (productIds.length > this.MAX_ITEMS) {
      throw new BadRequestException(
        `Máximo de ${this.MAX_ITEMS} produtos por comparação`,
      );
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        attributes: { orderBy: [{ group: 'asc' }, { key: 'asc' }] },
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Um ou mais produtos não foram encontrados');
    }

    // Busca a média de avaliações de cada produto
    const ratingsMap = await this.buildRatingsMap(productIds);

    // Coleta TODOS os atributos únicos de todos os produtos
    const allAttributeKeys = new Set<string>();
    products.forEach((p) =>
      p.attributes.forEach((a) =>
        allAttributeKeys.add(`${a.group || 'Geral'}::${a.key}`),
      ),
    );

    // Monta a tabela de comparação normalizada
    const comparisonTable = Array.from(allAttributeKeys).map((compositeKey) => {
      const [group, key] = compositeKey.split('::');
      const values = products.map((p) => {
        const attr = p.attributes.find((a) => a.key === key);
        return attr?.value ?? '—';
      });
      // Destaca linha se os valores são diferentes
      const allSame = values.every((v) => v === values[0]);
      return { group, key, values, highlight: !allSame };
    });

    // Agrupa por group para facilitar renderização
    const tableByGroup = comparisonTable.reduce(
      (acc, row) => {
        if (!acc[row.group]) acc[row.group] = [];
        acc[row.group].push(row);
        return acc;
      },
      {} as Record<string, typeof comparisonTable>,
    );

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        brand: p.brand,
        stock: p.stock,
        warranty: p.warranty,
        category: p.category,
        image: p.images[0]?.url ?? null,
        reviewCount: p._count.reviews,
        avgRating: ratingsMap[p.id] ?? null,
      })),
      comparisonTable: tableByGroup,
      totalAttributes: allAttributeKeys.size,
    };
  }

  /**
   * Gerencia a lista de comparação do usuário (salva no banco).
   */
  async addToCompareList(userId: string, productId: string) {
    let list = await this.prisma.compareList.findFirst({ where: { userId } });

    if (!list) {
      list = await this.prisma.compareList.create({ data: { userId } });
    }

    const count = await this.prisma.compareItem.count({
      where: { compareListId: list.id },
    });

    if (count >= this.MAX_ITEMS) {
      throw new BadRequestException(
        `Máximo de ${this.MAX_ITEMS} produtos na lista de comparação`,
      );
    }

    const item = await this.prisma.compareItem.upsert({
      where: { compareListId_productId: { compareListId: list.id, productId } },
      create: { compareListId: list.id, productId },
      update: {},
    });

    return item;
  }

  async removeFromCompareList(userId: string, productId: string) {
    const list = await this.prisma.compareList.findFirst({ where: { userId } });
    if (!list)
      throw new NotFoundException('Lista de comparação não encontrada');

    await this.prisma.compareItem.deleteMany({
      where: { compareListId: list.id, productId },
    });

    return { message: 'Produto removido da comparação' };
  }

  async getCompareList(userId: string) {
    const list = await this.prisma.compareList.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
      },
    });

    return list ?? { items: [] };
  }

  async clearCompareList(userId: string) {
    const list = await this.prisma.compareList.findFirst({ where: { userId } });
    if (list) {
      await this.prisma.compareItem.deleteMany({
        where: { compareListId: list.id },
      });
    }
    return { message: 'Lista de comparação limpa' };
  }

  private async buildRatingsMap(productIds: string[]) {
    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      where: { productId: { in: productIds }, isApproved: true },
      _avg: { rating: true },
    });
    return Object.fromEntries(ratings.map((r) => [r.productId, r._avg.rating]));
  }
}
