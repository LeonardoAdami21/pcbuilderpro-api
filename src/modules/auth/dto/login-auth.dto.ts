import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'joao@email.com',
    description: 'E-mail do usuário',
    type: String,
    required: true,
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
    type: String,
    required: true,
  })
  @IsString()
  password: string;
}
