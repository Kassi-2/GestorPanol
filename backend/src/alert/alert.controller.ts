import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { AlertService } from './alert.service';
import { AlertCreateDTO } from './dto/alert-create.dto';

@Controller('alerts')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getAllAlerts() {
    return await this.alertService.getAllAlerts();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async createAlert(@Body() request: AlertCreateDTO) {
    return await this.alertService.createAlert(request);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async markAlertAsViewed(@Param('id', ParseIntPipe) id: number) {
    return await this.alertService.markAlertAsViewed(id);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async deleteAlert(@Param('id', ParseIntPipe) id: number) {
    return await this.alertService.deleteAlert(id);
  }
}
