import {
  Controller,
  HttpStatus,
  HttpCode,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDTO } from './dto/user-create.dto';
import { UserUpdateDTO } from './dto/user-update.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @Get('/students')
  @HttpCode(HttpStatus.OK)
  public async getAllStudents() {
    return await this.userService.getAllStudents();
  }

  @Get('/teachers')
  @HttpCode(HttpStatus.OK)
  public async getAllTeachers() {
    return await this.userService.getAllTeachers();
  }

  @Get('/assistants')
  @HttpCode(HttpStatus.OK)
  public async getAllAssistant() {
    return await this.userService.getAllAssistants();
  }

  @Get('user/:id')
  @HttpCode(HttpStatus.OK)
  public async getUserById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserById(id);
  }

  @Get('/degrees')
  @HttpCode(HttpStatus.OK)
  public async getAllDegrees() {
    return await this.userService.getAllDegrees();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() request: UserCreateDTO) {
    return await this.userService.createUser(request);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() request: UserUpdateDTO,
  ) {
    return await this.userService.updateUser(id, request);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.deleteUser(id);
  }
  

}
