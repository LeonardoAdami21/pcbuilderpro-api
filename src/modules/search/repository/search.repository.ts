import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca full-text com PostgreSQL.
   * Retorna produtos, categorias e sugestões.
   */
  async search(q: string, limit = 20) {
    if (!q || q.trim().length < 2)
      return { products: [], categories: [], total: 0 };

    const term = q.trim();

    const [products, categories] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } },
            { sku: { contains: term, mode: 'insensitive' } },
            { model: { contains: term, mode: 'insensitive' } },
          ],
        },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
        take: limit,
      }),

      this.prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: term, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    return {
      products,
      categories,
      total: products.length + categories.length,
      query: term,
    };
  }

  /**
   * Autocomplete — retorna apenas nomes de produtos para o dropdown.
   * Ultra-rápido, máximo 8 resultados.
   */
  async autocomplete(q: string) {
    if (!q || q.trim().length < 2) return [];

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        name: { contains: q.trim(), mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        brand: true,
        images: { where: { isPrimary: true }, take: 1, select: { url: true } },
      },
      orderBy: { name: 'asc' },
      take: 8,
    });

    return products;
  }

  /**
   * Retorna os filtros disponíveis para uma busca (facets).
   * Usado para montar os checkboxes de filtro na sidebar.
   */
  async getFacets(categoryId?: string) {
    const where: any = {
      isActive: true,
      deletedAt: null,
      ...(categoryId && { categoryId }),
    };

    const [brands, priceRange] = await Promise.all([
      // Marcas disponíveis com contagem
      this.prisma.product.groupBy({
        by: ['brand'],
        where: { ...where, brand: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),

      // Range de preços
      this.prisma.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      brands: brands
        .filter((b) => b.brand)
        .map((b) => ({ name: b.brand, count: b._count.id })),
      priceRange: {
        min: Number(priceRange._min.price ?? 0),
        max: Number(priceRange._max.price ?? 0),
      },
    };
  }
}
