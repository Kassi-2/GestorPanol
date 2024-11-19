import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserCreateDTO } from './dto/user-create.dto';
import { Borrower, Degree, UserType } from '@prisma/client';

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

  //Crea un usuario ingresando los datos necesarios de un usuario
  //Devuelve una promesa que contendra al usuario creado
  //verifica si el usuario existe, en caso de que exista se retorna,
  // si el usuario no existe entonces lo crea
  public async createUser(user: UserCreateDTO): Promise<Borrower> {
    const existUser = await this.prismaService.borrower.findUnique({
      where: { rut: user.rut.toUpperCase() },
    });
  
    if (existUser) {
      return existUser;
    }
  
    try {
      const borrower: Borrower = await this.prismaService.borrower.create({
        data: {
          rut: user.rut.toUpperCase(),
          name: user.name.toUpperCase(),
          mail: user.mail ? user.mail.toLowerCase() : undefined,
          phoneNumber: user.phoneNumber,
          type: user.type,
        },
      });
  
      switch (user.type) {
        case UserType.Student:
          await this.prismaService.student.create({
            data: {
              id: borrower.id,
              codeDegree: user.degree,
            },
          });
          break;
  
        case UserType.Teacher:
          await this.prismaService.teacher.create({
            data: {
              id: borrower.id,
            },
          });
          break;
  
        case UserType.Assistant:
          await this.prismaService.assistant.create({
            data: {
              id: borrower.id,
              role: user.role,
            },
          });
          break;
      }
  
      return borrower;
    } catch (error) {
      throw error;
    }
  }

  //Eliminar un usuario, es decir que cambia el estado a desactivado
  //Devuelve una promesa que contendra la informacion del usuario desactivado
  //en caso de que el usuario no exista se devolvera un error
  public async deleteUser(id: number): Promise<Borrower> {
    try {
      const existUser = await this.prismaService.borrower.findUnique({
        where: { id },
      });
      if (!existUser) {
        throw new BadRequestException(
          'El usuario que se intenta eliminar no existe',
        );
      }
      const user = await this.prismaService.borrower.update({
        where: { id },
        data: { state: false },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}
