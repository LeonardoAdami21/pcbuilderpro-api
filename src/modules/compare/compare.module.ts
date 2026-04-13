import { forwardRef, Module } from '@nestjs/common';
import { CompareService } from './compare.service';
import { CompareController } from './compare.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CompareRepository } from './repository/compare.repository';

@Module({
  imports: [PrismaModule, forwardRef(() => ProductsModule), forwardRef(() => UsersModule)],
  controllers: [CompareController],
  providers: [CompareService, CompareRepository],
  exports: [CompareService],
})
export class CompareModule {}
