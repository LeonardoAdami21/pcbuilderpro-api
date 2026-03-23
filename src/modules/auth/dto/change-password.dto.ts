import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve ter ao menos 1 maiúscula, 1 minúscula e 1 número',
  })
  @ApiProperty({ minLength: 8, required: true, description: 'Senha atual' })
  currentPassword: string;

  @ApiProperty({ minLength: 8, required: true, description: 'Nova senha' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve ter ao menos 1 maiúscula, 1 minúscula e 1 número',
  })
  newPassword: string;
}
