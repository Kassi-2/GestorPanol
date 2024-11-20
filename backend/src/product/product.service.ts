import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { product } from '@prisma/client';
import { ProductCreateDTO } from './dto/product-create.dto';
import { ProductUpdateDTO } from './dto/product-update.dto';

@Injectable()
export class ProductService {
    constructor(private prisma: PrismaService) {}

    //Crear un producto ingresando los datos del modelo de Producto
  //devuelve los parámetros con los que fue creado el producto
  //verifica que no exista un prducto ya creado con el mismo nombre
  //revisa en los productos eliminados si ya existía un producto con el mismo nombre
  //si existía se actualizan los valores por los nuevos ingresados
  async createProduct(data: ProductCreateDTO): Promise<product> {
    const buscarProduct = await this.prisma.product.findUnique({
      where: {
        name: data.name,
      },
    });
    if (buscarProduct) {
      if (buscarProduct.state === false) {
        return this.prisma.product.update({
          where: {
            id: buscarProduct.id,
          },
          data: {
            ...data,
            state: true,
          },
        });
      } else {
        throw new BadRequestException('Ya existe un producto con ese nombre');
      }
    }
    return this.prisma.product.create({
      data,
    });
  }

  //Obtener todos los productos de la tabla product de la base de datos
  //Devuelve un array de solo los productos que tienen un stock mayor a 0
  //y los entrega ordenados alfabéticamente por nombre
  async getAvailableProducts(): Promise<product[]> {
    return this.prisma.product.findMany({
      where: {
        stock: { gt: 0 },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  //Obtener todos los productos de la tabla product de la base de datos
  //Devuelve un array de solo los productos que tienen estado true=activo,
  //y los entrega ordenados alfabéticamente por nombre descendentemente
  async getActiveProductsNameDesc(): Promise<product[]> {
    return this.prisma.product.findMany({
      where: {
        state: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async updateProduct(id: number, data: ProductUpdateDTO): Promise<product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product || product.state !== true) {
      throw new NotFoundException('No se encontró el producto');
    }
    if (data.name && data.name !== product.name) {
      const findProduct = await this.prisma.product.findFirst({
        where: {
          name: data.name,
          id: {
            not: id,
          },
        },
      });

      if (findProduct && findProduct.state === true) {
        throw new BadRequestException('Ya existe un producto con ese nombre');
      }

      if (findProduct && findProduct.state === false) {
        const updateName = `${findProduct.name}-${findProduct.id}`;
        await this.prisma.product.update({
          where: { id: findProduct.id },
          data: {
            name: updateName,
          },
        });
        return this.prisma.product.update({
          where: { id },
          data,
        });
      }
    }
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

}
