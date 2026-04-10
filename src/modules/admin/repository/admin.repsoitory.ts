import { Injectable } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { PrismaService } from '../../../modules/prisma/prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Dashboard — métricas em tempo real ───────────────────
  async getDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      totalProducts,
      lowStockProducts,
      totalOrders,
      ordersToday,
      pendingOrders,
      revenueToday,
      revenueThisMonth,
      revenueTotal,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.USER, deletedAt: null } }),
      this.prisma.user.count({
        where: { createdAt: { gte: today }, role: Role.USER },
      }),
      this.prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.product.count({
        where: { stock: { lte: 5 }, isActive: true, deletedAt: null },
      }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),

      // Receita hoje (pedidos pagos)
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: today } },
        _sum: { total: true },
      }),

      // Receita este mês
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: thisMonth } },
        _sum: { total: true },
      }),

      // Receita total
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),

      // Top 5 produtos mais vendidos
      this.prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Últimos 10 pedidos
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        newUsersToday,
        totalProducts,
        lowStockProducts,
        totalOrders,
        ordersToday,
        pendingOrders,
      },
      revenue: {
        today: revenueToday._sum.total ?? 0,
        thisMonth: revenueThisMonth._sum.total ?? 0,
        total: revenueTotal._sum.total ?? 0,
      },
      topProducts,
      recentOrders,
    };
  }

  // ── Relatório de vendas por período ──────────────────────
  async getSalesReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'PAID',
      },
      include: {
        items: {
          include: { product: { select: { name: true, brand: true } } },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Agrupa por dia
    const byDay = orders.reduce(
      (acc, o) => {
        const day = o.createdAt.toISOString().split('T')[0];
        if (!acc[day]) acc[day] = { orders: 0, revenue: 0 };
        acc[day].orders++;
        acc[day].revenue += Number(o.total);
        return acc;
      },
      {} as Record<string, { orders: number; revenue: number }>,
    );

    return {
      period: { start, end },
      summary: {
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue,
      },
      byDay,
      orders,
    };
  }

  // ── Listar todos os pedidos ───────────────────────────────
  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Atualizar status do pedido ────────────────────────────
  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === OrderStatus.SHIPPED && { shippedAt: new Date() }),
        ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date() }),
        ...(status === OrderStatus.CANCELLED && { cancelledAt: new Date() }),
        statusHistory: { create: { status, note } },
      },
      include: { user: { select: { name: true, email: true } } },
    });
    return order;
  }

  // ── Listar produtos com estoque baixo ─────────────────────
  async getLowStockProducts() {
    return this.prisma.product.findMany({
      where: { stock: { lte: 5 }, isActive: true, deletedAt: null },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { stock: 'asc' },
    });
  }

  // ── Listar todos os usuários ──────────────────────────────
  async getAllUsers(page = 1, limit = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Aprovar avaliações ────────────────────────────────────
  async getPendingReviews() {
    return this.prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveReview(reviewId: string, approve: boolean) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: approve },
    });
  }
}
