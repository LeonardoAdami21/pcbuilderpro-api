import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ComponentType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class CheckCompatibilityDto {
  @ApiProperty({ type: [String], description: 'IDs dos produtos' })
  @IsArray()
  @IsString({ each: true })
  productIds: string[] = [];
}

export class BuildSlotDto {
  @ApiProperty({ enum: ComponentType })
  @IsEnum(ComponentType)
  componentType: ComponentType = 'CPU';

  @ApiProperty()
  @IsString()
  productId: string = '';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

export class SaveBuildDto {
  @ApiProperty({
    example: 'Meu PC Gamer 2025',
    description: 'Nome do build',
    required: true,
  })
  @IsString()
  name: string = '';

  @ApiPropertyOptional({
    example: 'PC Gamer 2025',
    description: 'Descrição do build',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false, description: 'Build publico' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ type: [BuildSlotDto], description: 'Itens do build' })
  @IsArray()
  slots!: BuildSlotDto[];
}
