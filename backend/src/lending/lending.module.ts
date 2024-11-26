import { Module } from '@nestjs/common';
import { LendingController } from './lending.controller';
import { LendingService } from './lending.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [LendingController],
  providers: [LendingService],
  imports: [PrismaModule],
})
export class LendingModule {}
