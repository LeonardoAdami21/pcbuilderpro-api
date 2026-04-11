import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    type: String,
    required: true,
  })
  @IsString()
  productId?: string;

  @ApiProperty({
    description: 'Quantidade do produto',
    type: Number,
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [Array],
    description: 'Itens do pedido',
    example: [
      {
        productId: '1',
        quantity: 1,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] = [];

  @ApiProperty({
    description: 'ID do endereço de entrega',
    type: String,
    required: true,
  })
  @IsString()
  addressId!: string;

  @ApiProperty({
    enum: PaymentMethod,
    description: 'Forma de pagamento',
    required: true,
    example: 'CREDIT_CARD',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod = 'CREDIT_CARD';

  @ApiPropertyOptional({
    description: 'Código do cupom de desconto',
    type: String,
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Notas adicionais',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
