import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LendingService } from './lending/lending.service';
import { LendingController } from './lending/lending.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, LendingController],
  providers: [AppService, LendingService],
})
export class AppModule {}
