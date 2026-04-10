import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { OrderStatus } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Dashboard ─────────────────────────────────────────────
  @Get('dashboard')
  @ApiOperation({
    summary: '🛡️ Dashboard — métricas em tempo real',
    description: 'Rota privada para ver dashboard',
  })
  @ApiOkResponse({ description: 'Dashboard retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // ── Relatório de vendas ───────────────────────────────────
  @Get('reports/sales')
  @ApiOperation({
    summary: 'Relatório de vendas por período',
    description: 'Rota privada para ver relatório de vendas',
  })
  @ApiOkResponse({ description: 'Relatório de vendas retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({
    name: 'startDate',
    example: '2025-01-01',
    required: true,
    description: 'Data de inicio',
  })
  @ApiQuery({
    name: 'endDate',
    example: '2025-12-31',
    required: true,
    description: 'Data de fim',
  })
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getSalesReport(startDate, endDate);
  }

  // ── Pedidos ───────────────────────────────────────────────
  @Get('orders')
  @ApiOperation({
    summary: 'Listar todos os pedidos',
    description: 'Rota privada para listar todos os pedidos',
  })
  @ApiOkResponse({ description: 'Pedidos retornados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderStatus,
    type: 'enum',
    description: 'Status do pedido',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    type: Number,
    description: 'Página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 10,
    type: Number,
    description: 'Limite de itens por página',
  })
  getAllOrders(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
  ) {
    return this.adminService.getAllOrders(Number(page), Number(limit), status);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary: 'Atualizar status de um pedido',
    description: 'Rota privada para atualizar status de um pedido',
  })
  @ApiOkResponse({ description: 'Status do pedido atualizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Status inválido' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.note);
  }

  // ── Estoque ───────────────────────────────────────────────
  @Get('products/low-stock')
  @ApiOperation({
    summary: '⚠️ Produtos com estoque baixo (≤5 unidades)',
    description: 'Rota privada para ver produtos com estoque baixo',
  })
  @ApiOkResponse({
    description: 'Produtos com estoque baixo retornado com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getLowStock() {
    return this.adminService.getLowStockProducts();
  }

  // ── Usuários ──────────────────────────────────────────────
  @Get('users')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Rota privada para ver todos os usuários',
  })
  @ApiOkResponse({ description: 'Usuários retornado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    type: Number,
    description: 'Página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 10,
    type: Number,
    description: 'Limite de itens por página',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca',
  })
  getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(Number(page), Number(limit), search);
  }

  // ── Avaliações ────────────────────────────────────────────
  @Get('reviews/pending')
  @ApiOperation({
    summary: 'Avaliações aguardando aprovação',
    description: 'Rota privada para ver avaliações aguardando aprovação',
  })
  @ApiOkResponse({
    description: 'Avaliações aguardando aprovação retornado com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getPendingReviews() {
    return this.adminService.getPendingReviews();
  }

  @Patch('reviews/:id/approve')
  @ApiOperation({
    summary: 'Aprovar ou rejeitar avaliação',
    description: 'Rota privada para aprovar ou rejeitar avaliação',
  })
  @ApiOkResponse({ description: 'Avaliação aprovada ou rejeitada com sucesso' })
  @ApiBadRequestResponse({ description: 'Avaliação inválida' })
  @ApiUnauthorizedResponse({ description: 'Acesso negado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  approveReview(@Param('id') id: string, @Body() body: { approve: boolean }) {
    return this.adminService.approveReview(id, body.approve);
  }
}
