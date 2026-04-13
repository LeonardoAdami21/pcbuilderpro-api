import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class PriceHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna o histórico de preços de um produto.
   * Agrupa por período para otimizar gráficos.
   */
  async getHistory(productId: string, days = 90) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const history = await this.prisma.priceHistory.findMany({
      where: { productId, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { price: true, createdAt: true, source: true, note: true },
    });

    // Estatísticas do período
    const prices = history.map((h) => Number(h.price));
    const stats =
      prices.length > 0
        ? {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            current: Number(product.price),
            dropFromMax: Number(product.price) - Math.max(...prices),
            dropPercent:
              ((Math.max(...prices) - Number(product.price)) /
                Math.max(...prices)) *
              100,
          }
        : null;

    return {
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price,
      },
      history,
      stats,
      period: { days, since },
    };
  }

  /**
   * Registra manualmente uma alteração de preço.
   * Usado pelo Admin ao mudar o preço de um produto.
   */
  async recordPriceChange(
    productId: string,
    price: number,
    source: string,
    note?: string,
  ) {
    return this.prisma.priceHistory.create({
      data: { productId, price, source, note },
    });
  }

  /**
   * Retorna os produtos com maior queda de preço nos últimos N dias.
   * Ótimo para página de "Maiores Ofertas".
   */
  async getBiggestDrops(limit = 10, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Busca o maior preço de cada produto no período
    const histories = await this.prisma.priceHistory.groupBy({
      by: ['productId'],
      where: { createdAt: { gte: since } },
      _max: { price: true },
    });

    const results = await Promise.all(
      histories.map(async (h) => {
        const product = await this.prisma.product.findUnique({
          where: { id: h.productId, isActive: true, deletedAt: null },
          include: { images: { where: { isPrimary: true }, take: 1 } },
        });
        if (!product) return null;

        const maxPrice = Number(h._max.price);
        const currentPrice = Number(product.price);
        const dropPercent = ((maxPrice - currentPrice) / maxPrice) * 100;

        return { product, maxPrice, currentPrice, dropPercent };
      }),
    );

    return results
      .filter((r) => r !== null && r.dropPercent > 0)
      .sort((a, b) => b!.dropPercent - a!.dropPercent)
      .slice(0, limit);
  }
}
