import { Injectable, NotFoundException } from '@nestjs/common';
import { CompareRepository } from './repository/compare.repository';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CompareService {
  constructor(
    private readonly compareRepository: CompareRepository,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async compareProducts(productIds: string[]) {
    return this.compareRepository.compareProducts(productIds);
  }

  async addToCompareList(userId: string, productId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Usuário nao encontrado');
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto nao encontrado');
    const item = await this.compareRepository.addToCompareList(
      user.id,
      product.id,
    );
    return item;
  }

  async removeFromCompareList(userId: string, productId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Usuário nao encontrado');
    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Produto nao encontrado');
    const item = await this.compareRepository.removeFromCompareList(
      user.id,
      product.id,
    );
    return item;
  }

  async getCompareList(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Usuário nao encontrado');
    const items = await this.compareRepository.getCompareList(user.id);
    return items;
  }

  async clearCompareList(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('Usuário nao encontrado');
    const items = await this.compareRepository.clearCompareList(user.id);
    return items;
  }
}
