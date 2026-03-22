import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'João Silva',
    description: 'Nome do usuário',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 't6vVt@example.com',
    description: 'E-mail do usuário',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://avatar.com/avatar.jpg',
    description: 'Avatar do usuário',
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
