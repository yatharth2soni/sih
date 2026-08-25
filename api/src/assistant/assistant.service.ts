import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';
import {
  classifyIntent,
  AssistantIntent,
} from './intent-classifier';
import {
  ResponseGenerator,
  FormattedResponse,
} from './response-generator';
import { UserRole, CapaStatus, ViolationStatus, ComplianceStatus } from '@prisma/client';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. QUERY PROCESSING PIPELINE
  // ═══════════════════════════════════════════════════════════════════════════

  async processQuery(
    dto: AssistantQueryDto,
    user: RequestUser,
  ): Promise<FormattedResponse> {
    const question = dto.question.trim();
    if (!question) {
      throw new BadRequestException({ code: 'BAD_REQUEST', message: 'Question cannot be empty' });
    }

    // 1. Detect language & classify intent
    const { intent, detectedLanguage } = classifyIntent(question, dto.language);
    const lang = detectedLanguage;

    this.logger.log(
      `User ${user.email} (${user.role}) asked: "${question.slice(0, 60)}..." -> Classified: ${intent} [lang: ${lang}]`,
    );

    // 2. Resolve & assert scope
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
    let targetMineId = dto.mineId;

    if (targetMineId) {
      await this.scopeService.assertMineAccess(user, targetMineId);
    } else if (accessibleMineIds && accessibleMineIds.length > 0) {
      targetMineId = accessibleMineIds[0];
    } else if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      const firstMine = await this.prisma.mine.findFirst({ select: { id: true } });
      targetMineId = firstMine?.id;
    }

    // 3. Dispatch to server-owned domain handlers based on allowlisted intent
    switch (intent) {
      case AssistantIntent.MINE_RISK:
        return this.handleMineRisk(targetMineId, lang, user);

      case AssistantIntent.COMPLIANCE_STATUS:
        return this.handleComplianceStatus(accessibleMineIds, lang, user);

      case AssistantIntent.OVERDUE_CAPA:
        return this.handleOverdueCapa(accessibleMineIds, lang, user);

      case AssistantIntent.RECENT_VIOLATIONS:
        return this.handleRecentViolations(accessibleMineIds, lang, user);

      case AssistantIntent.GRIEVANCE_SUMMARY:
        return this.handleGrievanceSummary(accessibleMineIds, lang, user);

      case AssistantIntent.HELP_CAPABILITIES:
        return ResponseGenerator.formatHelp(lang);

      case AssistantIntent.UNKNOWN:
      default:
        return ResponseGenerator.formatUnknown(lang);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DOMAIN DATA HANDLERS (SCOPE-GROUNDED)
  // ═══════════════════════════════════════════════════════════════════════════

  private async handleMineRisk(
    mineId: string | undefined,
    lang: 'en' | 'hi',
    user: RequestUser,
  ): Promise<FormattedResponse> {
    if (!mineId) {
      return ResponseGenerator.formatUnknown(lang);
    }

    const [mine, riskScore, anomaliesCount] = await Promise.all([
      this.prisma.mine.findUnique({
        where: { id: mineId },
        select: { id: true, name: true, code: true },
      }),
      this.prisma.riskScore.findFirst({
        where: { mineId },
        orderBy: { calculatedAt: 'desc' },
      }),
      this.prisma.anomalyFlag.count({
        where: { mineId, status: 'OPEN' },
      }),
    ]);

    return ResponseGenerator.formatMineRisk(
      { mine, riskScore, anomaliesCount },
      lang,
    );
  }

  private async handleComplianceStatus(
    accessibleMineIds: string[] | null,
    lang: 'en' | 'hi',
    user: RequestUser,
  ): Promise<FormattedResponse> {
    const where: any = {};
    if (accessibleMineIds) {
      where.mineId = { in: accessibleMineIds };
    }

    const [total, compliant, nonCompliant, overdue] = await Promise.all([
      this.prisma.complianceRecord.count({ where }),
      this.prisma.complianceRecord.count({
        where: { ...where, status: ComplianceStatus.COMPLIANT },
      }),
      this.prisma.complianceRecord.count({
        where: { ...where, status: ComplianceStatus.NON_COMPLIANT },
      }),
      this.prisma.complianceRecord.count({
        where: {
          ...where,
          nextDueAt: { lt: new Date() },
          status: { not: ComplianceStatus.COMPLIANT },
        },
      }),
    ]);

    return ResponseGenerator.formatComplianceStatus(
      { total, compliant, nonCompliant, overdue },
      lang,
    );
  }

  private async handleOverdueCapa(
    accessibleMineIds: string[] | null,
    lang: 'en' | 'hi',
    user: RequestUser,
  ): Promise<FormattedResponse> {
    const where: any = {
      status: { in: [CapaStatus.OPEN, CapaStatus.IN_PROGRESS] },
    };
    if (accessibleMineIds) {
      where.violation = { mineId: { in: accessibleMineIds } };
    }

    const capas = await this.prisma.correctiveAction.findMany({
      where,
      take: 5,
      orderBy: { dueAt: 'asc' },
      select: {
        id: true,
        title: true,
        status: true,
        dueAt: true,
      },
    });

    return ResponseGenerator.formatOverdueCapa({ capas }, lang);
  }

  private async handleRecentViolations(
    accessibleMineIds: string[] | null,
    lang: 'en' | 'hi',
    user: RequestUser,
  ): Promise<FormattedResponse> {
    const where: any = {
      status: { in: [ViolationStatus.OPEN, ViolationStatus.UNDER_REVIEW] },
    };
    if (accessibleMineIds) {
      where.mineId = { in: accessibleMineIds };
    }

    const violations = await this.prisma.violation.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        severity: true,
        status: true,
      },
    });

    return ResponseGenerator.formatRecentViolations({ violations }, lang);
  }

  private async handleGrievanceSummary(
    accessibleMineIds: string[] | null,
    lang: 'en' | 'hi',
    user: RequestUser,
  ): Promise<FormattedResponse> {
    const where: any = {};
    if (accessibleMineIds) {
      where.mineId = { in: accessibleMineIds };
    } else if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId;
    }

    const [total, open, inProgress, resolved, escalated] = await Promise.all([
      this.prisma.grievance.count({ where }),
      this.prisma.grievance.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.grievance.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      this.prisma.grievance.count({ where: { ...where, status: 'RESOLVED' } }),
      this.prisma.grievance.count({ where: { ...where, status: 'ESCALATED' } }),
    ]);

    return ResponseGenerator.formatGrievanceSummary(
      { total, open, inProgress, resolved, escalated },
      lang,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CAPABILITIES INTROSPECTION
  // ═══════════════════════════════════════════════════════════════════════════

  getCapabilities() {
    return {
      supportedLanguages: ['en', 'hi'],
      supportedIntents: [
        {
          intent: AssistantIntent.MINE_RISK,
          description: 'Mine safety risk scores, risk bands, and active anomaly spikes',
          exampleQuestions: {
            en: 'What is the risk score for Jharia Block-4?',
            hi: 'झरिया खदान का जोखिम स्कोर क्या है?',
          },
        },
        {
          intent: AssistantIntent.COMPLIANCE_STATUS,
          description: 'Statutory compliance rates, compliant vs overdue records',
          exampleQuestions: {
            en: 'What is our statutory compliance rate?',
            hi: 'वैधानिक अनुपालन स्थिति बताएं',
          },
        },
        {
          intent: AssistantIntent.OVERDUE_CAPA,
          description: 'Open and overdue Corrective and Preventive Actions (CAPA)',
          exampleQuestions: {
            en: 'Show me overdue corrective actions',
            hi: 'लंबित कापा की सूची दें',
          },
        },
        {
          intent: AssistantIntent.RECENT_VIOLATIONS,
          description: 'Active safety violations and severity levels',
          exampleQuestions: {
            en: 'List open safety violations',
            hi: 'सक्रिय सुरक्षा उल्लंघन बताएं',
          },
        },
        {
          intent: AssistantIntent.GRIEVANCE_SUMMARY,
          description: 'Grievance counts by status (open, in progress, escalated, resolved)',
          exampleQuestions: {
            en: 'What is the grievance summary?',
            hi: 'शिकायत निवारण सारांश क्या है?',
          },
        },
        {
          intent: AssistantIntent.HELP_CAPABILITIES,
          description: 'Assistant commands and help guide',
          exampleQuestions: {
            en: 'What can you do?',
            hi: 'आप क्या कर सकते हैं?',
          },
        },
      ],
      filterParameters: ['mineId', 'companyId', 'from', 'to'],
      rateLimit: '10 requests per minute per IP/user',
      maxQuestionLength: 500,
      privacyPolicy:
        'Zero chat retention by default. Data queries are strictly scoped to authenticated user permissions. Natural language is never converted into arbitrary SQL.',
      disclaimer:
        'Informational governance summary only; does not replace statutory regulatory reporting or official certification.',
    };
  }
}
