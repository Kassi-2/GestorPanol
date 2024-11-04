import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LendingService } from './lending/lending.service';
import { LendingController } from './lending/lending.controller';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, LendingController, ProductController],
  providers: [AppService, LendingService, ProductService],
})
export class AppModule {}
