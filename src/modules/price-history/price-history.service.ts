import { Injectable, NotFoundException } from '@nestjs/common';
import { PriceHistoryRepository } from './repository/price-history.repository';
import { ProductsService } from '../products/products.service';

@Injectable()
export class PriceHistoryService {
  constructor(
    private readonly priceHistoryRepository: PriceHistoryRepository,
    private readonly productService: ProductsService,
  ) {}

  async getHistory(productId: string, days = 90) {
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto nao encontrado');
    const history = await this.priceHistoryRepository.getHistory(
      product.id,
      days,
    );

    return { product, history };
  }

  async getBiggestDrops(limit = 10, days = 30) {
    const results = await this.priceHistoryRepository.getBiggestDrops(
      limit,
      days,
    );
    return results;
  }

  async recordPriceChange(
    productId: string,
    price: number,
    source: string,
    note?: string,
  ) {
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto nao encontrado');
    const history = this.priceHistoryRepository.recordPriceChange(
      productId,
      price,
      source,
      note,
    );

    return history;
  }
}
