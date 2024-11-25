import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LendingService } from './lending/lending.service';
import { LendingController } from './lending/lending.controller';
import { ProductService } from './product/product.service';
import { ProductController } from './product/product.controller';
import { UserModule } from './user/user.module';
import { AlertModule } from './alert/alert.module';

@Module({
  imports: [PrismaModule, UserModule, AlertModule],
  controllers: [AppController, LendingController, ProductController],
  providers: [AppService, LendingService, ProductService],
})
export class AppModule {}
