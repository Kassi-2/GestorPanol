import { BadRequestException, Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductCreateDTO } from './dto/product-create.dto';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get('/active-name-desc')
  async getActiveProductsNameDesc() {
    return this.productService.getActiveProductsNameDesc();
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

  
}
