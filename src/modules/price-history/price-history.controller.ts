import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PriceHistoryService } from './price-history.service';
import { Public } from 'src/common/decorators/roles.decorator';

@ApiTags('price-history')
@UseGuards(JwtAuthGuard)
@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly service: PriceHistoryService) {}

  @Public()
  @Get('drops')
  @ApiOperation({
    summary: '📉 Maiores quedas de preço — ideal para página de ofertas',
    description:
      'Retorna os 10 produtos com maior queda de preço nos últimos 30 dias',
  })
  @ApiOkResponse({
    description:
      'Retorna os 10 produtos com maior queda de preço nos últimos 30 dias com sucesso',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getBiggestDrops(@Query('limit') limit = 10, @Query('days') days = 30) {
    return this.service.getBiggestDrops(Number(limit), Number(days));
  }

  @Public()
  @Get(':productId')
  @ApiOperation({
    summary: '📈 Histórico de preços de um produto',
    description: 'Rota que retorna o hsitorico de preços de um produto',
  })
  @ApiOkResponse({
    description: 'Retorna o histórico de preços de um produto com sucesso',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno no servidor' })
  @ApiParam({ name: 'productId', description: 'ID do produto', required: true })
  @ApiQuery({
    name: 'days',
    required: false,
    example: 90,
    description: 'Período em dias',
  })
  getHistory(@Param('productId') productId: string, @Query('days') days = 90) {
    return this.service.getHistory(productId, Number(days));
  }
}
