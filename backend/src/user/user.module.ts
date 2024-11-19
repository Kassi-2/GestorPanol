import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService, AuthGuard],
})
export class UserModule {}
