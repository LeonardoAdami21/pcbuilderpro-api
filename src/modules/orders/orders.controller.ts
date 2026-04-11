import {
  UseGuards,
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar pedido (checkout)',
    description: 'Rota para criar um pedido',
  })
  @ApiCreatedResponse({ description: 'Pedido criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar meus pedidos',
    description: 'Rota para listar todos os pedidos de um usuário',
  })
  @ApiOkResponse({ description: 'Pedidos listados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findAllByUser(userId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalhes de um pedido',
    description: 'Rota para detalhar um pedido',
  })
  @ApiOkResponse({ description: 'Pedido detalhado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findOne(id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar pedido',
    description: 'Rota para cancelar um pedido',
  })
  @ApiOkResponse({ description: 'Pedido cancelado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.cancel(id, userId);
  }
}
