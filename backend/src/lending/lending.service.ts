import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Lending, LendingState } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LendingCreateDTO } from './dto/lending-create.dto';
import { LendingUpdateDTO } from './dto/lending-update.dto';

@Injectable()
export class LendingService {
    constructor(private prisma: PrismaService) {}

    async getPendingLendings(): Promise<Lending[]> {
        return this.prisma.lending.findMany({
            where: {
                state: LendingState.Pending,
            },
            include: {
                borrower: { 
                    select: {
                      name: true,
                    },
                  },
                  teacher: { 
                    select: {
                      BorrowerId: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    async createLending(data: LendingCreateDTO) {
        try{
        if (data.teacherId) {
            const teacher = await this.prisma.teacher.findUnique({
                where: { id: data.teacherId },
            });
    
            if (!teacher) {
                throw new NotFoundException("Ese profesor no existe"); 
            }
            }
    
        const borrower = await this.prisma.borrower.findUnique({
            where: { id: data.BorrowerId },
        });
    
        if (!borrower) {
            throw new NotFoundException("Ese prestatario no existe");
        }
    
        for (const productData of data.products) {
            const product = await this.prisma.product.findUnique({
                where: { id: productData.productId },
            });
    
            if (!product) {
                throw new NotFoundException(`El producto ${productData.productId} no existe`);
            }

            if (productData.amount > product.stock) {
                throw new BadRequestException(`La cantidad del producto ${productData.productId} solicitado excede el stock disponible)`);
            }
        }

        const lendingState = data.teacherId ? LendingState.Pending : LendingState.Active;

    const lending = await this.prisma.lending.create({
        data: {
            BorrowerId: data.BorrowerId,
            teacherId: data.teacherId,
            comments: data.comments,
            state: lendingState, 
            lendingProducts: {
                create: data.products.map((product) => ({
                    productId: product.productId,
                    amount: product.amount,
                })),
            },
        },
        include: {
            lendingProducts: {
                include: {
                    product: true,
                },
            },
        },
    });

        for (const productData of data.products) {
            await this.prisma.product.update({
                where: { id: productData.productId },
                data: {
                    stock: {
                        decrement: productData.amount,
                    },
                },
            });
        }
        return lending;
    } catch (error) {
        throw (error);
      }
    }   
    
    async getLendingById(id: number): Promise<Lending> {
        return this.prisma.lending.findUnique({
          where: {
            id,
          },
          include: {
            lendingProducts: {
              select: {
                amount: true, 
                product: {
                  select: {
                    id: true,
                    name: true, 
                    stock: true,
                  },
                },
              },
            },
            borrower: {
              select: {
                name: true,
                rut: true,
              },
            },
            teacher:{
                select: {
                    BorrowerId: {
                      select: {
                        name: true,
                        rut: true,
                      },
                    },
                }
            }
          },
        });
      }

      async updateActivePending(lendingId: number):Promise<Lending>{
        try{
        const lending = await this.prisma.lending.findUnique({
            where: { id: lendingId },
        });
        if (!lending) {
            throw new NotFoundException("Ese préstamo no existe");
        }
        const updateLending = await this.prisma.lending.update({
            where: {id: lendingId},
            data: {
                state: LendingState.Active,
            },
        });
        return updateLending;
    } catch (error) {
        throw (error);
      }
      }


    //cambia el estado de un préstamo activo o pending a finalizado,
    //además le asigna le fecha en la que se finalizó y devuelve los
    //productos que no son fungibles al stock, se pueden agregar comentarios
    async finalizeLending(lendingId: number, comments?: string): Promise<Lending>{
        try{
        const lending = await this.prisma.lending.findUnique({
            where: { id: lendingId },
            include: {
                lendingProducts: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!lending) {
            throw new NotFoundException("Préstamo no encontrado");
        }
        const updatedLending = await this.prisma.lending.update({
            where: { id: lendingId },
            data: { state: LendingState.Finalized,
                finalizeDate: new Date(),
                comments: comments !== undefined ? comments : lending.comments,
             },
        });

        for (const lendingProduct of lending.lendingProducts) {
            const product = lendingProduct.product;
    
            if (!product.fungible) { 
                await this.prisma.product.update({
                    where: { id: product.id },
                    data: {
                        stock: {
                            increment: lendingProduct.amount, 
                        },
                    },
                });
            }
        }

        return updatedLending;
    } catch (error) {
        throw (error);
      }
    }

    //función que cambia el estado de un préstamo a Inactive, además agrega la fecha 
    //en la que se eliminó, devuelve el stock del producto si no es fungible
    async deleteLending(lendingId: number):Promise<Lending>{
      const lending = await this.prisma.lending.findUnique({
        where: { id: lendingId },
        include: {
            lendingProducts: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!lending) {
        throw new NotFoundException("Préstamo no encontrado");
    }

    const updatedLending = await this.prisma.lending.update({
        where: { id: lendingId },
        data: { state: LendingState.Inactive,
            eliminateDate: new Date(),
         },
    });

    for (const lendingProduct of lending.lendingProducts) {
        const product = lendingProduct.product;

        if (!product.fungible) { 
            await this.prisma.product.update({
                where: { id: product.id },
                data: {
                    stock: {
                        increment: lendingProduct.amount, 
                    },
                },
            });
        }
    }

    return updatedLending;   

    }

    //obtiene los préstamos con estado active, ordenados desde los más
    //recientes a los más antiguos por la fecha en la que se creó el préstamo
    async getActiveLendings(): Promise<Lending[]> {
        return this.prisma.lending.findMany({
            where: {
                state: LendingState.Active,
            },
            include: {
                borrower: { 
                    select: {
                      name: true,
                    },
                  },
                  teacher: { 
                    select: {
                      BorrowerId: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
            },
            orderBy: {
                date: "desc",
            },
        });
    }

    async deletePermanentlyLending(lendingId: number):Promise<Lending> {
        const lending = await this.prisma.lending.findUnique({
            where: { id: lendingId },
            include: {
                lendingProducts: {
                    include: {
                        product: true,
                    },
                },
            },
        });  
        if (!lending) {
            throw new NotFoundException("Préstamo no encontrado");
        }
        if (lending.state != LendingState.Pending) {
            throw new NotFoundException("El préstamo no está pendiente para rechazar");
        }
        for (const lendingProduct of lending.lendingProducts) {
            const product = lendingProduct.product;
    
            if (!product.fungible) {
                await this.prisma.product.update({
                    where: { id: product.id },
                    data: {
                        stock: {
                            increment: lendingProduct.amount,
                        },
                    },
                });
            }
        }
        await this.prisma.lendingProduct.deleteMany({
            where: { lendingId: lendingId },
        });
    
        return this.prisma.lending.delete({
            where: { id: lendingId },
        });
    }

    //obtiene solo los primeros 20 préstamos finalizados ordenados desde los 
    //más recientes a los más antiguos por la fecha en la que se finalizó el préstamo
      async getFinalizedLendingsMax(): Promise<Lending[]> {
        return this.prisma.lending.findMany({
            where: {
                state: LendingState.Finalized,
            },
            include: {
                borrower: { 
                    select: {
                      name: true,
                    },
                  },
                  teacher: { 
                    select: {
                      BorrowerId: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
            },
            orderBy: {
                finalizeDate: "desc",
            },
            take: 50,
        });
      }

      //Actualiza un préstamo, se pueden agregar y eliminar productos
      async updateLending(lendingId: number, data: LendingUpdateDTO): Promise<Lending> {
        try{
    	const lending = await this.prisma.lending.findUnique({
        	where: { id: lendingId },
        	include: {
            	lendingProducts: true,
        	},
    	});
    
    	if (!lending) {
        	throw new NotFoundException("Ese préstamo no existe");
    	}
    	if (lending.state !== LendingState.Active && lending.state !== LendingState.Pending) {
        	throw new NotFoundException("El préstamo está finalizado, por lo que ya no se puede editar");
    	}
    	if (data.teacherId) {
        	const teacher = await this.prisma.teacher.findUnique({
            	where: { id: data.teacherId },
        	});
        	if (!teacher) {
            	throw new NotFoundException("El profesor asignado no existe");
        	}
    	}
    
    	const productIdsInRequest = data.products.map((p) => p.productId);
    	const productsToDelete = lending.lendingProducts.filter(
        	(p) => !productIdsInRequest.includes(p.productId)
    	);
    
    	for (const lendingProduct of productsToDelete) {
        	await this.prisma.product.update({
            	where: { id: lendingProduct.productId },
            	data: {
                	stock: {
                    	increment: lendingProduct.amount,
                	},
            	},
        	});
    	}
    	await this.prisma.lendingProduct.deleteMany({
        	where: {
            	lendingId: lendingId,
            	productId: {
                	notIn: productIdsInRequest,
            	},
        	},
    	});
    	for (const productData of data.products) {
        	const product = await this.prisma.product.findUnique({
            	where: { id: productData.productId },
        	});
        	if (!product) {
            	throw new NotFoundException(`El producto ${productData.productId} no existe`);
        	}
        	const existingLendingProduct = lending.lendingProducts.find(
            	(p) => p.productId === productData.productId
        	);
    
        	const availableStock = existingLendingProduct
            	? product.stock + existingLendingProduct.amount
            	: product.stock;
        	if (productData.amount > availableStock) {
            	throw new BadRequestException(
                	`La cantidad del producto ${productData.productId} solicitado excede el stock disponible`
            	);
        	}
    	}
    	await this.prisma.lending.update({
        	where: { id: lendingId },
        	data: {
            	teacherId: data.teacherId ?? lending.teacherId,
            	comments: data.comments ?? lending.comments,
            	lendingProducts: {
                	upsert: data.products.map((productData) => ({
                    	where: {
                        	lendingId_productId: {
                            	lendingId: lendingId,
                            	productId: productData.productId,
                        	},
                    	},
                    	update: {
                        	amount: productData.amount,
                    	},
                    	create: {
                        	productId: productData.productId,
                        	amount: productData.amount,
                    	},
                	})),
            	},
        	},
    	});
    	for (const productData of data.products) {
        	const existingLendingProduct = lending.lendingProducts.find(
            	(p) => p.productId === productData.productId
        	);
    
        	const previousAmount = existingLendingProduct ? existingLendingProduct.amount : 0;
        	const newAmount = productData.amount;
        	await this.prisma.product.update({
            	where: { id: productData.productId },
            	data: {
                	stock: {
                    	decrement: newAmount - previousAmount,
                	},
            	},
        	});
    	}
    	const updatedLending = await this.prisma.lending.findUnique({
        	where: { id: lendingId },
        	include: {
            	lendingProducts: {
                	include: {
                    	product: true,
                	},
            	},
        	},
    	});
    
    	return updatedLending;
    } catch (error) {
        throw (error);
      }
	}
}