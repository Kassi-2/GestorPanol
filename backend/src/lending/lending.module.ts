import { Module } from '@nestjs/common';
import { LendingController } from './lending.controller';
import { LendingService } from './lending.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [LendingController],
  providers: [LendingService, AuthGuard],
  imports: [PrismaModule, ConfigModule],
})
export class LendingModule {}
