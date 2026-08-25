import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OcrService } from './ocr.service';
import { CreateOcrJobDto } from './dto/create-ocr-job.dto';
import { ReviewOcrJobDto } from './dto/review-ocr-job.dto';
import { QueryOcrJobsDto } from './dto/query-ocr-jobs.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('jobs')
  @HttpCode(HttpStatus.ACCEPTED)
  async createJob(
    @Body() dto: CreateOcrJobDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.ocrService.createJob(dto, user);
    return { data };
  }

  @Get('jobs')
  async getJobs(
    @Query() query: QueryOcrJobsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ocrService.getJobs(query, user);
  }

  @Get('jobs/:id')
  async getJob(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.ocrService.getJob(id, user);
    return { data };
  }

  @Get('jobs/:id/extraction')
  async getExtraction(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.ocrService.getExtraction(id, user);
    return { data };
  }

  @Post('jobs/:id/review')
  async reviewExtraction(
    @Param('id') id: string,
    @Body() dto: ReviewOcrJobDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.ocrService.reviewExtraction(id, dto, user);
    return { data };
  }

  @Post('jobs/:id/retry')
  async retryJob(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.ocrService.retryJob(id, user);
    return { data };
  }
}
