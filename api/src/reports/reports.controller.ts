import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { QueryComplianceReportsDto } from './dto/query-reports.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('compliance')
  async getComplianceReport(
    @Query() query: QueryComplianceReportsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reportsService.getComplianceReport(query, user);
  }

  @Get('statutory/export')
  async exportStatutoryReport(
    @Query() dto: ExportReportDto,
    @CurrentUser() user: RequestUser,
    @Res() res: Response,
  ) {
    const result = await this.reportsService.exportStatutoryReport(dto, user);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });

    return res.end(result.buffer);
  }
}
