import {
  UseGuards,
  Controller,
  Get,
  Query,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompareService } from './compare.service';
import { Public } from 'src/common/decorators/roles.decorator';

@ApiTags('compare')
@UseGuards(JwtAuthGuard)
@Controller('compare')
export class CompareController {
  constructor(private readonly service: CompareService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: '⚖️ Comparar produtos lado a lado (até 4)',
    description:
      'Rota para comparação de produtos. O limite de produtos para comparação é de 4',
  })
  @ApiOkResponse({ description: 'Produtos comparados com sucesso' })
  @ApiInternalServerErrorResponse({ description: 'Erro ao comparar produtos' })
  @ApiQuery({
    name: 'ids',
    description: 'IDs separados por vírgula',
    example: 'id1,id2,id3',
  })
  compare(@Query('ids') ids: string) {
    const productIds = ids
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    return this.service.compareProducts(productIds);
  }

  @Get('list')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar produtos na fila de comparação do usuário',
    description: 'Rota para listar produtos na fila de comparação do usuário',
  })
  @ApiOkResponse({ description: 'Produtos listados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({
    description: 'Fila de comparação do usuário não encontrada',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro ao listar produtos na fila de comparação do usuário',
  })
  getList(@CurrentUser('id') userId: string) {
    return this.service.getCompareList(userId);
  }

  @Post('list')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Adicionar produto à fila de comparação',
    description: 'Rota para adicionar produto à fila de comparação',
  })
  @ApiCreatedResponse({
    description: 'Produto adicionado à fila de comparação com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({
    description: 'Fila de comparação do usuário não encontrada',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro ao adicionar produto à fila de comparação',
  })
  addToList(
    @CurrentUser('id') userId: string,
    @Body() dto: { productId: string },
  ) {
    return this.service.addToCompareList(userId, dto.productId);
  }

  @Delete('list/clear')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Limpar fila de comparação',
    description: 'Rota para limpar fila de comparação',
  })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({
    description: 'Fila de comparação do usuário não encontrada',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro ao limpar fila de comparação',
  })
  clearList(@CurrentUser('id') userId: string) {
    return this.service.clearCompareList(userId);
  }

  @Delete('list/:productId')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Remover produto da fila de comparação',
    description: 'Rota para remover produto da fila de comparação',
  })
  @ApiOkResponse({
    description: 'Produto removido da fila de comparação com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado' })
  @ApiNotFoundResponse({
    description: 'Fila de comparação do usuário ou produto nao encontrado',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro ao remover produto da fila de comparação',
  })
  removeFromList(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.removeFromCompareList(userId, productId);
  }
}
