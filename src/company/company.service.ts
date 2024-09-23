import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RegisterCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async registerCompany(
    userId: string,
    registerCompanyDto: RegisterCompanyDto,
  ) {
    const { name, description, website, location, logo } = registerCompanyDto;

    const existingCompany = await this.prisma.company.findUnique({
      where: { name },
    });

    if (existingCompany) {
      throw new BadRequestException("you can't add same company.");
    }

    const company = await this.prisma.company.create({
      data: {
        name,
        description,
        website,
        location,
        logo,
        userId,
      },
    });

    return company;
  }

  // get companies
  async getCompanies(userId: string) {
    const companies = await this.prisma.company.findMany({
      where: { userId },
    });

    if (!companies || companies?.length == 0) {
      throw new NotFoundException('Company not found');
    }

    return companies;
  }

  // get company by id
  async getCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  // delete company
  async deleteCompany(id: string) {
    const company = await this.prisma.company.delete({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not deleted');
    }

    return company;
  }

  // update company
  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }
}
