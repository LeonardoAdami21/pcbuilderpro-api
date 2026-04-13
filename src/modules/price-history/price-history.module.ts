import { forwardRef, Module } from '@nestjs/common';
import { PriceHistoryService } from './price-history.service';
import { PriceHistoryController } from './price-history.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceHistoryRepository } from './repository/price-history.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PrismaModule, forwardRef(() => ProductsModule)],
  controllers: [PriceHistoryController],
  providers: [PriceHistoryService, PriceHistoryRepository],
  exports: [PriceHistoryService],
})
export class PriceHistoryModule {}
