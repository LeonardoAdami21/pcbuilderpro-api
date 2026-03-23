import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterAuthDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do usuário',
    type: String,
    minLength: 2,
    maxLength: 100,
    required: true,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail do usuário',
    type: String,
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123.456.789-00',
    required: true,
    type: String,
    description: 'CPF do usuário',
  })
  @IsString()
  cpf: string;

  @ApiProperty({
    example: 'Senha@123',
    minLength: 8,
    required: true,
    description: 'Senha do usuário',
    type: String,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve ter ao menos 1 maiúscula, 1 minúscula e 1 número',
  })
  password: string;

  @ApiProperty({
    example: '(27) 99999-9999',
    required: false,
    type: String,
    description: 'Telefone do usuário',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
