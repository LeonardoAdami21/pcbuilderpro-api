import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Valida endereço
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');

    // Busca produtos e valida estoque
    const products = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId, isActive: true, deletedAt: null },
        });
        if (!product)
          throw new NotFoundException(
            `Produto ${item.productId} não encontrado`,
          );
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}`,
          );
        }
        return { product, quantity: item.quantity };
      }),
    );

    // Calcula valores
    const subtotal = products.reduce(
      (sum: number, { product, quantity }) =>
        sum + Number(product.price) * quantity,
      0,
    );

    // Aplica cupom se informado
    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: dto.couponCode,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
          usedCount: { lte: 10 },
        },
      });
      if (coupon) {
        discount =
          coupon.discountType === 'PERCENTAGE'
            ? subtotal * (Number(coupon.discountValue) / 100)
            : Number(coupon.discountValue);
        if (coupon.maxDiscount)
          discount = Math.min(discount, Number(coupon.maxDiscount));
        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const shippingCost = subtotal > 299 ? 0 : 19.9; // frete grátis acima de R$299
    const total = subtotal - discount + shippingCost;

    // Gera número do pedido
    const orderNumber = `PED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Cria pedido em transação
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: dto.addressId,
          paymentMethod: dto.paymentMethod,
          subtotal,
          discount,
          shippingCost,
          total,
          couponCode: dto.couponCode,
          notes: dto.notes,
          statusHistory: {
            create: { status: OrderStatus.PENDING, note: 'Pedido criado' },
          },
          items: {
            create: products.map(({ product, quantity }) => ({
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              quantity,
              unitPrice: product.price,
              total: Number(product.price) * quantity,
            })),
          },
        },
        include: { items: true, address: true },
      });

      // Decrementa estoque
      await Promise.all(
        products.map(({ product, quantity }) =>
          tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: quantity } },
          }),
        ),
      );

      return newOrder;
    });

    return order;
  }

  async findAllByUser(userId: string, page = 1, limit = 10) {
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true }, take: 1 } },
              },
            },
          },
          address: true,
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        address: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.userId !== userId) throw new ForbiddenException('Acesso negado');
    return order;
  }

  async cancel(id: string, userId: string) {
    const order = await this.findOne(id, userId);
    const cancellable: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PAYMENT_CONFIRMED,
    ];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        'Pedido não pode ser cancelado neste status',
      );
    }

    // Devolve estoque
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              status: OrderStatus.CANCELLED,
              note: 'Cancelado pelo cliente',
            },
          },
        },
      });
      await Promise.all(
        order.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
    });

    return { message: 'Pedido cancelado com sucesso' };
  }
}
