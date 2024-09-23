import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private primsa: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const {
      fullname,
      email,
      phoneNumber,
      password,
      profileBio,
      profileSkills,
      profileResume,
      profileResumeOriginalName,
      profilePhoto,
      role,
    } = registerUserDto;

    if (!fullname || !email || !phoneNumber || !password) {
      throw new BadRequestException('All fields are required');
    }
    console.log(registerUserDto, 'registerUserDto');

    const existingUser = await this.primsa.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword, 'hashedPassword');

    const user = await this.primsa.user.create({
      data: {
        fullname,
        email,
        phoneNumber,
        password: hashedPassword,
        profileBio,
        profileSkills,
        profileResume,
        profileResumeOriginalName,
        profilePhoto,
        role,
      },
    });

    if (!user) {
      throw new BadRequestException('User not created');
    }

    return { user, success: true, message: 'Successfully user created' };
  }

  // login
  async login(email: string, password: string, role: string) {
    if (!email || !password || !role) {
      throw new BadRequestException('All fields are required');
    }

    const user = await this.primsa.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not exist');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Incorrect password');
    }

    if (role !== user.role) {
      throw new BadRequestException("Account dosn't exist with current role");
    }

    const token = this.jwtService.sign(
      { userId: user.id },
      { secret: process.env.SECRET_KEY, expiresIn: '1d' },
    );

    return {
      token,
      user,
      success: true,
      message: 'Successfully loggedin user',
    };
  }

  // logout
  async logout(): Promise<{ message: string; success: boolean }> {
    return { message: 'Logged Out successfully', success: true };
  }

  // update user
  async updateProfile(id: string, updateUserDto: UpdateUserDto) {
    const {
      fullname,
      email,
      phoneNumber,
      profileBio,
      profileSkills,
      profileResume,
      profilePhoto,
    } = updateUserDto;

    if (!fullname || !email || !phoneNumber || !profileBio || !profileSkills) {
      throw new BadRequestException('All fields are required');
    }

    const user = await this.primsa.user.update({
      where: { id },
      data: {
        fullname,
        email,
        phoneNumber,
        profileBio,
        profileSkills,
        profileResume,
        profilePhoto,
      },
    });

    return user;
  }
}
