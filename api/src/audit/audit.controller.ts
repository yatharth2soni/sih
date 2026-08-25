import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { VerifyAuditChainDto } from './dto/verify-audit-chain.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async getLogs(
    @Query() query: QueryAuditLogsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.auditService.getLogs(query, user);
  }

  @Get('verify')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE)
  async verifyChain(
    @Query() query: VerifyAuditChainDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.auditService.verifyChain(query, user);
    return { data };
  }

  @Get('entity/:type/:id')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async getEntityHistory(
    @Param('type') type: string,
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.auditService.getEntityHistory(type, id, user);
    return { data };
  }
}
