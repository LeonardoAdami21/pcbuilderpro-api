import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, wishlist: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, name: true, email: true, phone: true, avatar: true },
    });
  }

  // ── Endereços ────────────────────────────────────────────
  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    try {
      // Se isDefault, remove o default anterior
      if (dto.isDefault) {
        await this.prisma.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      const newAddress = await this.prisma.address.create({
        data: {
          city: dto.city,
          complement: dto.complement,
          neighborhood: dto.neighborhood,
          isDefault: dto.isDefault,
          number: dto.number,
          label: dto.label,
          recipientName: dto.recipientName,
          street: dto.street,
          zipCode: dto.zipCode,
          state: dto.state,
          userId,
        },
      });
      return newAddress;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async findOneAddress(userId: string) {
    const address = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!address) throw new NotFoundException('Usuário nao encontrado');
    return address;
  }

  async removeAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Endereço não encontrado');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Endereço removido' };
  }

  // ── Wishlist ─────────────────────────────────────────────
  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggleWishlist(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { added: false, message: 'Removido da lista de desejos' };
    }

    // Verifica se o produto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');

    await this.prisma.wishlist.create({ data: { userId, productId } });
    return { added: true, message: 'Adicionado à lista de desejos' };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), email: `deleted_${userId}@deleted.com` },
    });
    return { message: 'Conta encerrada com sucesso' };
  }
}
