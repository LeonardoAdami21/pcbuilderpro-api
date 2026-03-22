import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Meu perfil',
    description: 'Rota para obter o perfil do usuário',
  })
  @ApiOkResponse({ description: 'Perfil retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Atualizar perfil',
    description: 'Rota para atualizar o perfil do usuário',
  })
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiNotFoundResponse({ description: 'Perfil não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Delete('profile')
  @ApiOperation({
    summary: 'Encerrar minha conta',
    description: 'Rota para encerrar a conta do usuário',
  })
  deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAccount(userId);
  }

  // ── Endereços ─────────────────────────────────────────────
  @Get('addresses')
  @ApiOperation({
    summary: 'Listar meus endereços',
    description: 'Rota para listar os endereços do usuário',
  })
  @ApiOkResponse({ description: 'Endereços retornados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiNotFoundResponse({ description: 'Endereço não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getAddresses(@CurrentUser('id') userId: string) {
    return this.usersService.getAddresses(userId);
  }

  @Post('addresses')
  @ApiOperation({
    summary: 'Adicionar endereço',
    description: 'Rota para adicionar um endereço ao usuário',
  })
  createAddress(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAddressDto,
  ) {
    return this.usersService.createAddress(userId, dto);
  }

  @Patch('addresses/:id')
  @ApiOperation({
    summary: 'Atualizar endereço',
    description: 'Rota para atualizar um endereço do usuário',
  })
  updateAddress(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(userId, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({
    summary: 'Remover endereço',
    description: 'Rota para remover um endereço do usuário',
  })
  removeAddress(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.usersService.removeAddress(userId, id);
  }

  // ── Wishlist ──────────────────────────────────────────────
  @Get('wishlist')
  @ApiOperation({
    summary: '❤️ Minha lista de desejos',
    description: 'Rota para obter a lista de desejos do usuário',
  })
  getWishlist(@CurrentUser('id') userId: string) {
    return this.usersService.getWishlist(userId);
  }

  @Post('wishlist/:productId')
  @ApiOperation({
    summary: 'Adicionar/remover da wishlist (toggle)',
    description:
      'Rota para adicionar/remover um produto na wishlist do usuário',
  })
  @ApiOkResponse({ description: 'Produto adicionado/removido com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiNotFoundResponse({ description: 'Produto não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  toggleWishlist(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.usersService.toggleWishlist(userId, productId);
  }
}
