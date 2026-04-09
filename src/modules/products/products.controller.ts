import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  UpdateStockDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public, Role, Roles } from '../../common/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Criar produto',
    description: 'Rota privada para criar um produto',
  })
  @ApiCreatedResponse({ description: 'Produto criado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autorizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Slug duplicado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar produtos com filtros e paginação',
    description: 'Rota para listagem de produtos',
  })
  @ApiOkResponse({ description: 'Produtos listados com sucesso' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':slug/slug')
  @ApiOperation({
    summary: 'Buscar produto por slug (página do produto)',
    description: 'Rota para buscar um produto pelo slug',
  })
  @ApiOkResponse({ description: 'Produto encontrado com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiParam({ name: 'slug', example: 'rtx-4090-founders-edition' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({
    summary: 'Produtos relacionados',
    description: 'Rota para buscar produtos relacionados',
  })
  @ApiOkResponse({ description: 'Produtos encontrados com sucesso' })
  @ApiNotFoundResponse({ description: 'Produtos nao encontrados' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findRelated(@Param('id') id: string) {
    return this.productsService.findRelated(id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description: 'Rota para buscar um produto pelo ID',
  })
  @ApiOkResponse({ description: 'Produto encontrado com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[ADMIN] Atualizar produto',
    description: 'Rota privada para atualizar um produto',
  })
  @ApiOkResponse({ description: 'Produto atualizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autorizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/stock')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '[ADMIN] Atualizar estoque',
    description: 'Rota privada para atualizar o estoque de um produto',
  })
  @ApiOkResponse({ description: 'Estoque atualizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autorizado' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.productsService.updateStock(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[ADMIN] Remover produto (soft delete)',
    description: 'Rota privada para remover um produto',
  })
  @ApiOkResponse({ description: 'Produto removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Produto nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autorizado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
