import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
  UpdateStockDto,
} from './dto/product.dto';
import { ProductRepository } from './repository/product.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  // ── Criar produto ─────────────────────────────────────────
  async create(dto: CreateProductDto) {
    const product = await this.productRepository.create(dto);
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
      limit = 10,
    } = query;

    const products = await this.productRepository.findAll({
      search,
      categoryId,
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      orderBy,
      page: page,
      limit: limit,
    });
    return products;
  }

  // ── Buscar por slug ───────────────────────────────────────
  async findBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  // ── Buscar por ID ─────────────────────────────────────────
  async findOne(id: string) {
    const product = await this.productRepository.findOne(id);
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }

  // ── Atualizar produto ─────────────────────────────────────
  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    await this.productRepository.update(id, dto);
    return { message: 'Produto atualizado com sucesso' };
  }

  // ── Atualizar estoque ─────────────────────────────────────
  async updateStock(id: string, dto: UpdateStockDto) {
    await this.findOne(id);
    await this.productRepository.updateStock(id, dto);
    return { message: 'Estoque atualizado com sucesso' };
  }

  // ── Soft delete ───────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id);
    await this.productRepository.remove(id);
    return { message: 'Produto removido com sucesso' };
  }

  // ── Produtos relacionados ─────────────────────────────────
  async findRelated(id: string, limit = 8) {
    const product = await this.findOne(id);
    const products = await this.productRepository.findRelated(
      product.categoryId,
      limit,
    );
    return products;
  }
}
