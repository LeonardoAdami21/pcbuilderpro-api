import { UseGuards, Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';
import { Public } from 'src/common/decorators/roles.decorator';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Busca full-text de produtos e categorias',
    description: 'Rota para busca full-text de produtos e categorias',
  })
  @ApiOkResponse({
    description: 'Produtos, categorias e sugestões retornados com sucesso',
  })
  @ApiUnauthorizedResponse({ description: 'Sem autorização' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({ name: 'q', type: String, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  search(@Query('q') q: string, @Query('limit') limit = 20) {
    return this.service.search(q, Number(limit));
  }

  @Public()
  @Get('autocomplete')
  @ApiOperation({
    summary: '⚡ Autocomplete para a barra de busca',
    description: 'Rota para autocomplete para a barra de busca',
  })
  @ApiOkResponse({ description: 'Produtos retornados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Sem autorização' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  autocomplete(@Query('q') q: string) {
    return this.service.autocomplete(q);
  }

  @Public()
  @Get('facets')
  @ApiOperation({
    summary: 'Filtros disponíveis (brands, price range) para a sidebar',
    description:
      'Rota para filtros disponíveis (brands, price range) para a sidebar',
  })
  @ApiOkResponse({ description: 'Filtros retornados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Sem autorização' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  getFacets(@Query('categoryId') categoryId?: string) {
    return this.service.getFacets(categoryId);
  }
}
