import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
  IsPositive,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductAttributeDto {
  @ApiProperty({ example: 'Socket', description: 'Nome do atributo' })
  @IsString()
  key?: string;

  @ApiProperty({ example: 'AM5', description: 'Valor do atributo' })
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    example: 'Processador',
    description: 'Grupo do atributo',
  })
  @IsOptional()
  @IsString()
  group?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'RTX-4090-FE', description: 'SKU do produto' })
  @IsString()
  sku?: string;

  @ApiProperty({
    example: 'Placa de Vídeo NVIDIA RTX 4090 Founders Edition',
    description: 'Nome do produto',
  })
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'Placa de Vídeo NVIDIA RTX 4090 Founders Edition',
    description: 'Descrição do produto',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Placa de Vídeo NVIDIA RTX 4090 Founders Edition',
    description: 'Descrição curta do produto',
  })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @ApiProperty({ example: 12999.99, description: 'Preço' })
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ example: 15999.99, description: 'Preço riscado' })
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiPropertyOptional({
    example: 12999.99,
    description: 'Preço de custo',
  })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @ApiProperty({ example: 10, description: 'Estoque' })
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: 0.5, description: 'Peso' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'NVIDIA' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: '4090', description: 'Modelo' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 36, description: 'Garantia em meses' })
  @IsOptional()
  @IsInt()
  warranty?: number;

  @ApiProperty({ description: 'ID da categoria', example: '1' })
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [ProductAttributeDto],
    description: 'Atributos',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  minPrice?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  maxPrice?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  inStock?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    enum: [
      'price_asc',
      'price_desc',
      'newest',
      'best_reviewed',
      'best_selling',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class UpdateStockDto {
  @ApiProperty({ example: 50, description: 'Estoque' })
  @IsInt()
  @Min(0)
  stock?: number;
}
