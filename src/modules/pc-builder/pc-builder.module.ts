import { Module } from '@nestjs/common';
import { PcBuilderService } from './pc-builder.service';
import { PcBuilderController } from './pc-builder.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PcBuilderRepository } from './repository/pc-builder.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PcBuilderController],
  providers: [PcBuilderService, PcBuilderRepository],
  exports: [PcBuilderService],
})
export class PcBuilderModule {}
