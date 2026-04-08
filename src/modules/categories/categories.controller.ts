import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public, Role, Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@ApiTags('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Criar categoria',
    description: 'Rota privada para criar uma categoria',
  })
  @ApiCreatedResponse({ description: 'Categoria criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Erro ao criar categoria' })
  @ApiUnauthorizedResponse({ description: 'Nao autorizado' })
  @ApiConflictResponse({ description: 'Categoria ja cadastrada' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Public()
  @Get('tree')
  @ApiOperation({
    summary: 'Árvore completa de categorias (menu lateral)',
    description: 'Rota para buscar a árvore completa de categorias',
  })
  @ApiOkResponse({ description: 'Árvore completa de categorias' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findTree() {
    return this.categoriesService.findTree();
  }

  @Public()
  @Get(':slug/slug')
  @ApiOperation({
    summary: 'Buscar categoria por slug',
    description: 'Rota para buscar uma categoria por slug',
  })
  @ApiOkResponse({ description: 'Categoria encontrada' })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar categoria por ID',
    description: 'Rota para buscar uma categoria por ID',
  })
  @ApiOkResponse({ description: 'Categoria encontrada' })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Atualizar categoria',
    description: 'Rota privada para atualizar uma categoria',
  })
  @ApiOkResponse({ description: 'Categoria atualizada com sucesso' })
  @ApiBadRequestResponse({ description: 'Erro ao atualizar categoria' })
  @ApiUnauthorizedResponse({ description: 'Nao autorizado' })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[ADMIN] Desativar categoria',
    description: 'Rota privada para desativar uma categoria',
  })
  @ApiOkResponse({ description: 'Categoria desativada' })
  @ApiUnauthorizedResponse({ description: 'Nao autorizado' })
  @ApiNotFoundResponse({ description: 'Categoria nao encontrada' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
