import { Public } from 'src/common/decorators/roles.decorator';
import { PcBuilderService } from './pc-builder.service';
import {
  Get,
  Param,
  Query,
  Post,
  Body,
  Controller,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ComponentType } from '@prisma/client';
import { CheckCompatibilityDto, SaveBuildDto } from './dto/save-build.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@ApiTags('pc-builder')
@UseGuards(JwtAuthGuard)
@Controller('pc-builder')
export class PcBuilderController {
  constructor(private readonly pcBuilderService: PcBuilderService) {}

  @Public()
  @Get('components/:type')
  @ApiOperation({
    summary: '🖥️ Listar componentes disponíveis por tipo',
    description: 'Rota para Listar todos os componentes disponiveis',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Buscar por nome ou marca',
  })
  @ApiOkResponse({ description: 'Componentes listados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuario nao autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  getComponents(
    @Param('type') type: ComponentType,
    @Query('q') query?: string,
  ) {
    return this.pcBuilderService.getComponentsByType(type, query);
  }

  @Public()
  @Post('compatibility')
  @ApiOperation({
    summary: '✅ Verificar compatibilidade entre componentes',
    description: 'Rota para verificar compatibilidade entre componentes',
  })
  @ApiCreatedResponse({ description: 'Compatibilidade verificada com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuario nao autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  checkCompatibility(@Body() dto: CheckCompatibilityDto) {
    return this.pcBuilderService.checkCompatibility(dto.productIds);
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Builds públicos da comunidade',
    description: 'Rota para listar builds publicos da comunidade',
  })
  @ApiOkResponse({ description: 'Builds publicos listados com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuario nao autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Quantidade de builds publicos',
    type: Number,
  })
  getPublicBuilds(@Query('limit') limit = 10) {
    return this.pcBuilderService.getPublicBuilds(Number(limit));
  }

  @Post('save')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Salvar configuração de PC',
    description: 'Rota para salvar configuração de PC',
  })
  @ApiCreatedResponse({ description: 'Build salvo com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Usuario nao autenticado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  saveBuild(@Body() dto: SaveBuildDto) {
    return this.pcBuilderService.saveBuild(dto);
  }
}
