import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Iniciar sesión para un usuario existente
  // Valida el nombre de usuario y la contraseña, generando un token JWT si son correctos
  // Devuelve un objeto con el token de acceso
  public async login(user: LoginDTO) {
    try {
      const existUser = await this.prismaService.user.findUnique({
        where: { username: user.username },
      });
      if (!existUser) {
        throw new BadRequestException('Usuario o contraseña invalidos');
      }

      const isMatch = await bcrypt.compare(user.password, existUser.password);

      if (!isMatch) {
        throw new BadRequestException('Constraseña no valida');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithOutPassword } = existUser;
      const payload = {
        ...userWithOutPassword,
      };
      const access_token = await this.jwtService.signAsync(payload);
      return { access_token };
    } catch (error) {
      throw error;
    }
  }

  // Registrar un nuevo usuario en el sistema
  // Hashea la contraseña y guarda los datos en la base de datos
  // Devuelve una promesa que contiene los datos del usuario registrado
  public async register(newUser: RegisterDTO) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(newUser.password, saltOrRounds);

    const user = this.prismaService.user.create({
      data: {
        mail: newUser.mail,
        username: newUser.username,
        password: hash,
      },
    });
    return user;
  }
}
