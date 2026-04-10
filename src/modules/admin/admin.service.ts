import { Injectable } from '@nestjs/common';
import { AdminRepository } from './repository/admin.repsoitory';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async getDashboard() {
    const dashboard = await this.adminRepository.getDashboard();
    return dashboard;
  }

  async getSalesReport(startDate: string, endDate: string) {
    const report = await this.adminRepository.getSalesReport(
      startDate,
      endDate,
    );
    return report;
  }

  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const orders = await this.adminRepository.getAllOrders(page, limit, status);
    return orders;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await this.adminRepository.updateOrderStatus(
      orderId,
      status,
      note,
    );
    return order;
  }

  async getLowStockProducts() {
    const products = await this.adminRepository.getLowStockProducts();
    return products;
  }

  async getAllUsers(page = 1, limit = 20, search?: string) {
    const users = await this.adminRepository.getAllUsers(page, limit, search);
    return users;
  }

  async getPendingReviews() {
    const reviews = await this.adminRepository.getPendingReviews();
    return reviews;
  }

  async approveReview(reviewId: string, approve: boolean) {
    const review = await this.adminRepository.approveReview(reviewId, approve);
    return review;
  }
}
