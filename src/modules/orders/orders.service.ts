import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepository } from './repository/order.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.orderRepository.create(userId, dto);
    return order;
  }

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const orders = await this.orderRepository.findAllByUser(
      userId,
      page,
      limit,
    );
    return orders;
  }

  async findOne(id: string, userId: string) {
    const order = await this.orderRepository.findOne(id, userId);
    return order;
  }

  async cancel(id: string, userId: string) {
    const order = await this.orderRepository.cancel(id, userId);
    return order;
  }
}
