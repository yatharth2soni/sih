import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponse<Company>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { mines: true },
      }),
      this.prisma.company.count(),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: { mines: true },
    });

    if (!company) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Company with id "${id}" not found`,
      });
    }

    return company;
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type || 'SUBSIDIARY',
        status: dto.status || 'ACTIVE',
      },
    });
  }
}
