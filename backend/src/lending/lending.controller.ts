import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { LendingService } from './lending.service';
import { LendingCreateDTO } from './dto/lending-create.dto';
import { LendingFinalizeDTO } from './dto/lending-finalize.dto';

@Controller('lending')
export class LendingController {
    constructor(private readonly lendingService: LendingService){}

    

    @Get("/active-lending")
    async getActive(){
        return this.lendingService.getActiveLendings()
    }

    @Get("/finalized-lending-max")
    async getFinalizedMax(){
        return this.lendingService.getFinalizedLendingsMax()
    }
    
    @Post()
    async createLending(@Body(ValidationPipe) request: LendingCreateDTO){
        return this.lendingService.createLending(request)
    }

    @Put("/finalize-lending/:id")
    async finalizeLending(@Param('id') id: number, @Body() LendingFinalizeDTO: LendingFinalizeDTO){
            const { comments } = LendingFinalizeDTO;
            return this.lendingService.finalizeLending(Number(id), comments);
        }

    @Delete('/delete/:id')
    async deleteLending(@Param('id') id: string) {
        return this.lendingService.deleteLending(Number(id));
    }
}
