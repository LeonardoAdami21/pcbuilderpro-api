import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from 'src/common/utils/slugify';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
  UpdateStockDto,
} from '../dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Criar produto ─────────────────────────────────────────
  async create(dto: CreateProductDto) {
    const slug = await this.ensureUniqueSlug(slugify(dto.name as string));

    // Verifica SKU duplicado
    const skuExists = await this.prisma.product.findUnique({
      where: { sku: dto.sku },
    });
    if (skuExists) throw new ConflictException(`SKU "${dto.sku}" já existe`);

    const { attributes, ...data } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...data,
        slug,
        name: dto.name as string,
        price: dto.price || 0,
        comparePrice: dto.comparePrice,
        costPrice: dto.costPrice,
        sku: dto.sku as string,
        categoryId: dto.categoryId as string,
        ...(attributes && {
          attributes: {
            create: attributes as any,
          },
        }),
      },
      include: { images: true, attributes: true, category: true },
    });

    // Registra o preço inicial no histórico
    await this.prisma.priceHistory.create({
      data: {
        productId: product.id,
        price: dto.price || 0,
        source: 'system',
        note: 'Produto criado',
      },
    });

    return product;
  }

  // ── Listar com filtros e paginação ────────────────────────
  async findAll(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      orderBy,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {
      deletedAt: null,
      isActive: true,
      ...(categoryId && { categoryId }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(inStock && { stock: { gt: 0 } }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderByMap: Record<string, any> = {
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      newest: { createdAt: 'desc' },
      best_reviewed: { reviews: { _count: 'desc' } },
      best_selling: { orderItems: { _count: 'desc' } },
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: orderByMap[orderBy || 'newest'],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ── Buscar por slug ───────────────────────────────────────
  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        images: { orderBy: { position: 'asc' } },
        attributes: { orderBy: { group: 'asc' } },
        category: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, wishlist: true } },
      },
    });


    // Calcula média de avaliações
    const avgRating = await this.prisma.review.aggregate({
      where: { productId: product?.id, isApproved: true },
      _avg: { rating: true },
    });

    return { ...product, avgRating: avgRating._avg.rating };
  }

  // ── Buscar por ID ─────────────────────────────────────────
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { images: true, attributes: true, category: true },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  // ── Atualizar produto ─────────────────────────────────────
  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { attributes, ...data } = dto;

    // Se mudou o preço, registra no histórico
    if (dto.price) {
      await this.prisma.priceHistory.create({
        data: {
          productId: id,
          price: dto.price,
          source: 'manual',
          note: 'Atualização manual',
        },
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        name: dto.name as string,
        description: dto.description as string,
        shortDesc: dto.shortDesc as string,
        categoryId: dto.categoryId as string,
        ...(dto.price && { price: dto.price }),
        ...(dto.comparePrice && { comparePrice: dto.comparePrice }),
        ...(dto.costPrice && { costPrice: dto.costPrice }),
        ...(attributes && {
          attributes: {
            deleteMany: {},
            create: attributes as any,
          },
        }),
      },
      include: { images: true, attributes: true, category: true },
    });
  }

  // ── Atualizar estoque ─────────────────────────────────────
  async updateStock(id: string, dto: UpdateStockDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { stock: dto.stock },
      select: { id: true, sku: true, name: true, stock: true },
    });
  }

  // ── Soft delete ───────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    return { message: 'Produto removido com sucesso' };
  }

  // ── Produtos relacionados ─────────────────────────────────
  async findRelated(id: string, limit = 8) {
    const product = await this.findOne(id);
    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
        isActive: true,
        deletedAt: null,
        stock: { gt: 0 },
      },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: limit,
      orderBy: { orderItems: { _count: 'desc' } },
    });
  }

  // ── Helper: gera slug único ───────────────────────────────
  private async ensureUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let count = 0;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      count++;
      slug = `${base}-${count}`;
    }
    return slug;
  }
}
