import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RegisterCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async registerCompany(
    @Req() req,
    @Body() registerCompanyDto: RegisterCompanyDto,
  ) {
    const userId = req.user.id;
    const result = await this.companyService.registerCompany(
      userId,
      registerCompanyDto,
    );

    return {
      message: 'Company created successfully',
      result,
      success: true,
    };
  }

  // get companies
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCompanies(@Req() req: any) {
    const userId = req.user.id;
    console.log(userId, 'userId');

    const result = await this.companyService.getCompanies(userId);

    return {
      result,
      success: true,
    };
  }

  // get company by id
  @Get(':id')
  async getCompanyByid(@Param('id') companyId: string) {
    const company = await this.companyService.getCompanyById(companyId);
    return {
      company,
      success: true,
    };
  }

  // delete company
  @Delete(':id')
  async deleteCompany(@Param('id') companyId: string) {
    const result = await this.companyService.deleteCompany(companyId);
    return {
      result,
      success: true,
      message: 'Company deleted successfylly',
    };
  }

  // update company
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCompany(
    @Param('id') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const result = await this.companyService.updateCompany(
      companyId,
      updateCompanyDto,
    );

    return {
      result,
      success: true,
      message: 'Company updated successfully',
    };
  }
}
