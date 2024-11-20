import { BadRequestException, Body, Controller, Get, Param, Post, Put, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductCreateDTO } from './dto/product-create.dto';
import { ProductUpdateDTO } from './dto/product-update.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get('/active-name-desc')
  async getActiveProductsNameDesc() {
    return this.productService.getActiveProductsNameDesc();
  }

  @Get('/available')
  async getAvailableProducts() {
    return this.productService.getAvailableProducts();
  }

  @Post()
  async createProduct(@Body(ValidationPipe) request: ProductCreateDTO) {
    if (!request.name) {
      throw new BadRequestException('Ingresa un nombre del producto');
    }
    if (request.stock < 0) {
      throw new BadRequestException(
        'El stock debe ser un número igual o mayor a 0',
      );
    }
    if (request.criticalStock < 1) {
      throw new BadRequestException(
        'El stock crítico debe ser un número igual o mayor a 1',
      );
    }
    return this.productService.createProduct(request);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body(ValidationPipe) data: ProductUpdateDTO,
  ) {
    if (data.stock < 0) {
      throw new BadRequestException(
        'El stock debe ser un número igual o mayor a 0',
      );
    }
    if (data.criticalStock < 1) {
      throw new BadRequestException(
        'El stock crítico debe ser un número igual o mayor a 1',
      );
    }
    const product = await this.productService.updateProduct(Number(id), data);
    return product;
  }

  
}
