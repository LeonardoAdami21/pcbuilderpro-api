import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Casa', description: 'Label do endereço' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'João Silva', description: 'Nome do destinatário' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '29100-000', description: 'CEP' })
  @IsString()
  zipCode: string;

  @ApiProperty({ example: 'Rua das Acácias', description: 'Rua' })
  @IsString()
  street: string;

  @ApiProperty({ example: '123', description: 'Número' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ example: 'Apto 401', description: 'Complemento' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Centro', description: 'Bairro' })
  @IsString()
  neighborhood: string;

  @ApiProperty({ example: 'Vila Velha', description: 'Cidade' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'ES', description: 'Estado' })
  @IsString()
  state: string;

  @ApiPropertyOptional({ default: false, description: 'Endereço padrão' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
