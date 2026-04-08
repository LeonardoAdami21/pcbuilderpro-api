import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Placas de Vídeo', description: 'Nome da categoria' })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Placas de Vídeo',
    description: 'Descrição da categoria',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://image.com/image.jpg',
    description: 'Imagem da categoria',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 'https://image.com/image.jpg',
    description: 'Icone da categoria',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'ID da categoria pai (para subcategorias)',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ default: 0, description: 'Posição da categoria' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
