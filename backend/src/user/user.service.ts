import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Borrower, Degree } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  //Obtener todos los usuarios que se encuentren en la base de datos
  public async getAllUsers(): Promise<Borrower[]> {
    return this.prismaService.borrower.findMany();
  }

  //Obtener todos los estudiantes activos que se encuentren en la base de datos
  //Devuelve una promesa que contendra un array de estudiantes y los entrega
  //ordenados alfabeticamente
  public async getAllStudents(): Promise<Borrower[]> {
    return await this.prismaService.borrower.findMany({
      where: { state: true, type: 'Student' },
      include: { student: true },
      orderBy: { name: 'asc' },
    });
  }

  //Obtener todos los profesores activos que se encuentren en la base de datos
  //Devuelve una promesa que contendra un array de profesores y los entrega
  //ordenados alfabeticamente
  public async getAllTeachers(): Promise<Borrower[]> {
    try {
      return await this.prismaService.borrower.findMany({
        where: { state: true, type: 'Teacher' },
        include: { teacher: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw error;
    }
  }

  //Obtener todos los asistentes activos que se encuentren en la base de datos
  //Devuelve una promesa que contendra un array de asistentes y los entrega
  //ordenados alfabeticamente
  public async getAllAssistants(): Promise<Borrower[]> {
    try {
      return await this.prismaService.borrower.findMany({
        where: { state: true, type: 'Assistant' },
        include: { assistant: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      throw error;
    }
  }

  //Obtener un producto por su id
  //Devuelve una promesa que contendrá al prestatario
  //en caso de que no exista el prestatario devolverá un error
  public async getUserById(id: number): Promise<Borrower> {
    try {
      const existUser = await this.prismaService.borrower.findUnique({
        where: { id },
        include: {
          student: true,
          teacher: true,
          assistant: true,
        },
      });
      if (!existUser) {
        throw new BadRequestException(
          'El usuario que se intenta obetener no existe',
        );
      }
      return existUser;
    } catch (error) {
      throw error;
    }
  }

  //Obtener todas las carreras que se encuentran en la base de datos
  //Devuelve una promesa que contendra un array de carreras
  public async getAllDegrees(): Promise<Degree[]> {
    return this.prismaService.degree.findMany();
  }
}
