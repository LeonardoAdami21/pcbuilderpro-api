import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(userId: string) {
    return this.userRepository.getProfile(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.userRepository.updateProfile(userId, dto);
  }

  async getAddresses(userId: string) {
    return this.userRepository.getAddresses(userId);
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    return this.userRepository.createAddress(userId, dto);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    return this.userRepository.updateAddress(userId, addressId, dto);
  }

  async removeAddress(userId: string, addressId: string) {
    return this.userRepository.removeAddress(userId, addressId);
  }

  async getWishlist(userId: string) {
    return this.userRepository.getWishlist(userId);
  }

  async toggleWishlist(userId: string, productId: string) {
    return this.userRepository.toggleWishlist(userId, productId);
  }

  async deleteAccount(userId: string) {
    return this.userRepository.deleteAccount(userId);
  }
}
