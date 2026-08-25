import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMineDto } from './dto/create-mine.dto';
import { UpdateMineDto } from './dto/update-mine.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { Mine } from '@prisma/client';

@Injectable()
export class MinesService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: PaginationDto & { companyId?: string },
  ): Promise<PaginatedResponse<Mine>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (query.companyId) {
      where.companyId = query.companyId;
    }

    const [data, total] = await Promise.all([
      this.prisma.mine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { company: true },
      }),
      this.prisma.mine.count({ where }),
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

  async findOne(id: string): Promise<Mine> {
    const mine = await this.prisma.mine.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine with id "${id}" not found`,
      });
    }

    return mine;
  }

  async create(dto: CreateMineDto): Promise<Mine> {
    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Company with id "${dto.companyId}" not found`,
      });
    }

    return this.prisma.mine.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        code: dto.code,
        location: dto.location,
        geoBoundary: dto.geoBoundary as any ?? undefined,
        status: dto.status || 'ACTIVE',
      },
      include: { company: true },
    });
  }

  async update(id: string, dto: UpdateMineDto): Promise<Mine> {
    // Verify mine exists
    await this.findOne(id);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.geoBoundary !== undefined) data.geoBoundary = dto.geoBoundary;
    if (dto.status !== undefined) data.status = dto.status;


    return this.prisma.mine.update({
      where: { id },
      data,
      include: { company: true },
    });
  }
}
