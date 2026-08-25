-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MINE_OFFICIAL', 'CORPORATE', 'REGULATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ComplianceCategory" AS ENUM ('SAFETY', 'ENVIRONMENT', 'LABOUR', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ApplicableTo" AS ENUM ('MINE', 'COMPANY', 'ALL');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'PENDING');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ObservationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingType" AS ENUM ('NOTE', 'UNSAFE_CONDITION', 'NON_COMPLIANCE');

-- CreateEnum
CREATE TYPE "ViolationStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'WAIVED');

-- CreateEnum
CREATE TYPE "CapaStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMPLIANCE_DUE', 'COMPLIANCE_OVERDUE', 'VIOLATION_RAISED', 'CAPA_DUE', 'CAPA_OVERDUE', 'GRIEVANCE_SLA', 'RISK_HIGH');

-- CreateEnum
CREATE TYPE "EscalationOutcome" AS ENUM ('SENT', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskBand" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnomalyType" AS ENUM ('VIOLATION_SPIKE', 'OVERDUE_CAPA_CLUSTER', 'RECURRING_NON_COMPLIANCE');

-- CreateEnum
CREATE TYPE "AnomalyStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ContractorStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "WorkerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('EMPLOYEE', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('MANUAL', 'MOBILE', 'KIOSK');

-- CreateEnum
CREATE TYPE "GrievancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "GrievanceCategory" AS ENUM ('SAFETY', 'HARASSMENT', 'WAGE_PAYMENT', 'EQUIPMENT', 'ENVIRONMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CommentVisibility" AS ENUM ('REPORTER_AND_HANDLERS', 'HANDLERS_ONLY');

-- CreateEnum
CREATE TYPE "OcrJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "OcrTargetType" AS ENUM ('COMPLIANCE_RECORD', 'INSPECTION', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mine" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "geoBoundary" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMineAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMineAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRequirement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ComplianceCategory" NOT NULL,
    "frequency" TEXT NOT NULL,
    "description" TEXT,
    "applicableTo" "ApplicableTo" NOT NULL DEFAULT 'MINE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "nextDueAt" TIMESTAMP(3),
    "status" "ComplianceStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionTemplate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "category" "ComplianceCategory",
    "description" TEXT,
    "checklist" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "templateId" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "conductedById" TEXT,
    "createdById" TEXT NOT NULL,
    "purpose" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ComplianceCategory",
    "severity" "ObservationSeverity" NOT NULL DEFAULT 'MEDIUM',
    "findingType" "FindingType" NOT NULL DEFAULT 'NOTE',
    "complianceRequirementId" TEXT,
    "complianceRecordId" TEXT,
    "isViolationCandidate" BOOLEAN NOT NULL DEFAULT false,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Violation" (
    "id" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "complianceRequirementId" TEXT,
    "complianceRecordId" TEXT,
    "severity" "ObservationSeverity" NOT NULL,
    "status" "ViolationStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Violation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "violationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "CapaStatus" NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closureNote" TEXT,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "readAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationLog" (
    "id" TEXT NOT NULL,
    "ruleKey" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "recipientId" TEXT,
    "recipientRole" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "outcome" "EscalationOutcome" NOT NULL DEFAULT 'SENT',
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskScore" (
    "id" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "band" "RiskBand" NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "factors" JSONB NOT NULL,
    "sourceCounts" JSONB NOT NULL,
    "plainLanguageExplanation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyFlag" (
    "id" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "type" "AnomalyType" NOT NULL,
    "status" "AnomalyStatus" NOT NULL DEFAULT 'OPEN',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baseline" JSONB NOT NULL,
    "observed" JSONB NOT NULL,
    "threshold" TEXT NOT NULL,
    "calculationVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "relatedRiskScoreId" TEXT,
    "actionReason" TEXT,
    "actionById" TEXT,
    "actionAt" TIMESTAMP(3),
    "dedupKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnomalyFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "registrationNumber" TEXT,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "status" "ContractorStatus" NOT NULL DEFAULT 'ACTIVE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorContract" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mineId" TEXT,
    "contractNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "scopeOfWork" JSONB,
    "terminationReason" TEXT,
    "terminatedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorWorker" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "employeeCode" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "governmentIdHash" TEXT,
    "governmentIdMasked" TEXT,
    "role" TEXT,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorWorkerAssignment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorWorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "employeeCode" TEXT,
    "phone" TEXT,
    "status" "WorkerStatus" NOT NULL DEFAULT 'ACTIVE',
    "contractorWorkerId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "mineId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "businessDate" TEXT NOT NULL,
    "checkInAt" TIMESTAMP(3) NOT NULL,
    "checkOutAt" TIMESTAMP(3),
    "checkInLatitude" DOUBLE PRECISION,
    "checkInLongitude" DOUBLE PRECISION,
    "checkOutLatitude" DOUBLE PRECISION,
    "checkOutLongitude" DOUBLE PRECISION,
    "checkInMethod" "AttendanceMethod" NOT NULL DEFAULT 'MANUAL',
    "checkOutMethod" "AttendanceMethod",
    "recordedById" TEXT NOT NULL,
    "note" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "mineId" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "GrievanceCategory" NOT NULL,
    "priority" "GrievancePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "slaDueAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrievanceComment" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "visibility" "CommentVisibility" NOT NULL DEFAULT 'REPORTER_AND_HANDLERS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrievanceComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrievanceStatusHistory" (
    "id" TEXT NOT NULL,
    "grievanceId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "GrievanceStatus" NOT NULL,
    "toStatus" "GrievanceStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrievanceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "companyId" TEXT,
    "mineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OcrJob" (
    "id" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "status" "OcrJobStatus" NOT NULL DEFAULT 'QUEUED',
    "engineName" TEXT NOT NULL DEFAULT 'mock-ocr-v1',
    "engineVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "languageHints" TEXT[],
    "targetType" "OcrTargetType",
    "targetId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OcrJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OcrExtraction" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "rawText" TEXT,
    "confidence" DOUBLE PRECISION,
    "fields" JSONB NOT NULL,
    "correctedFields" JSONB,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "isLinked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OcrExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "sequence" SERIAL NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "companyId" TEXT,
    "mineId" TEXT,
    "beforeSummary" JSONB,
    "afterSummary" JSONB,
    "metadata" JSONB,
    "prevHash" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "hmacHash" TEXT NOT NULL,
    "chainVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Mine_code_key" ON "Mine"("code");

-- CreateIndex
CREATE INDEX "Mine_companyId_idx" ON "Mine"("companyId");

-- CreateIndex
CREATE INDEX "Mine_status_idx" ON "Mine"("status");

-- CreateIndex
CREATE INDEX "UserMineAssignment_userId_idx" ON "UserMineAssignment"("userId");

-- CreateIndex
CREATE INDEX "UserMineAssignment_mineId_idx" ON "UserMineAssignment"("mineId");

-- CreateIndex
CREATE INDEX "UserMineAssignment_active_idx" ON "UserMineAssignment"("active");

-- CreateIndex
CREATE UNIQUE INDEX "UserMineAssignment_userId_mineId_key" ON "UserMineAssignment"("userId", "mineId");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_category_idx" ON "ComplianceRequirement"("category");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_applicableTo_idx" ON "ComplianceRequirement"("applicableTo");

-- CreateIndex
CREATE INDEX "ComplianceRequirement_active_idx" ON "ComplianceRequirement"("active");

-- CreateIndex
CREATE INDEX "ComplianceRecord_mineId_idx" ON "ComplianceRecord"("mineId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_requirementId_idx" ON "ComplianceRecord"("requirementId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_status_idx" ON "ComplianceRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRecord_requirementId_mineId_key" ON "ComplianceRecord"("requirementId", "mineId");

-- CreateIndex
CREATE INDEX "InspectionTemplate_companyId_idx" ON "InspectionTemplate"("companyId");

-- CreateIndex
CREATE INDEX "InspectionTemplate_isActive_idx" ON "InspectionTemplate"("isActive");

-- CreateIndex
CREATE INDEX "Inspection_mineId_status_scheduledFor_idx" ON "Inspection"("mineId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Inspection_conductedById_status_idx" ON "Inspection"("conductedById", "status");

-- CreateIndex
CREATE INDEX "Inspection_createdById_idx" ON "Inspection"("createdById");

-- CreateIndex
CREATE INDEX "Observation_inspectionId_idx" ON "Observation"("inspectionId");

-- CreateIndex
CREATE INDEX "Observation_complianceRequirementId_idx" ON "Observation"("complianceRequirementId");

-- CreateIndex
CREATE INDEX "Observation_complianceRecordId_idx" ON "Observation"("complianceRecordId");

-- CreateIndex
CREATE INDEX "Observation_severity_idx" ON "Observation"("severity");

-- CreateIndex
CREATE INDEX "Observation_findingType_idx" ON "Observation"("findingType");

-- CreateIndex
CREATE UNIQUE INDEX "Observation_inspectionId_sequenceNumber_key" ON "Observation"("inspectionId", "sequenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Violation_observationId_key" ON "Violation"("observationId");

-- CreateIndex
CREATE INDEX "Violation_mineId_status_severity_raisedAt_idx" ON "Violation"("mineId", "status", "severity", "raisedAt");

-- CreateIndex
CREATE INDEX "Violation_complianceRequirementId_idx" ON "Violation"("complianceRequirementId");

-- CreateIndex
CREATE INDEX "Violation_complianceRecordId_idx" ON "Violation"("complianceRecordId");

-- CreateIndex
CREATE INDEX "Violation_raisedById_idx" ON "Violation"("raisedById");

-- CreateIndex
CREATE INDEX "CorrectiveAction_violationId_status_dueAt_idx" ON "CorrectiveAction"("violationId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "CorrectiveAction_assignedToId_status_dueAt_idx" ON "CorrectiveAction"("assignedToId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "CorrectiveAction_assignedById_idx" ON "CorrectiveAction"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_readAt_createdAt_idx" ON "Notification"("recipientId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_resourceType_resourceId_idx" ON "Notification"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "EscalationLog_idempotencyKey_key" ON "EscalationLog"("idempotencyKey");

-- CreateIndex
CREATE INDEX "EscalationLog_resourceType_resourceId_stage_idx" ON "EscalationLog"("resourceType", "resourceId", "stage");

-- CreateIndex
CREATE INDEX "EscalationLog_occurredAt_idx" ON "EscalationLog"("occurredAt");

-- CreateIndex
CREATE INDEX "EscalationLog_ruleKey_idx" ON "EscalationLog"("ruleKey");

-- CreateIndex
CREATE INDEX "RiskScore_mineId_calculatedAt_idx" ON "RiskScore"("mineId", "calculatedAt");

-- CreateIndex
CREATE INDEX "RiskScore_companyId_calculatedAt_idx" ON "RiskScore"("companyId", "calculatedAt");

-- CreateIndex
CREATE INDEX "RiskScore_band_idx" ON "RiskScore"("band");

-- CreateIndex
CREATE UNIQUE INDEX "AnomalyFlag_dedupKey_key" ON "AnomalyFlag"("dedupKey");

-- CreateIndex
CREATE INDEX "AnomalyFlag_mineId_status_detectedAt_idx" ON "AnomalyFlag"("mineId", "status", "detectedAt");

-- CreateIndex
CREATE INDEX "AnomalyFlag_type_idx" ON "AnomalyFlag"("type");

-- CreateIndex
CREATE INDEX "Contractor_companyId_status_idx" ON "Contractor"("companyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_companyId_registrationNumber_key" ON "Contractor"("companyId", "registrationNumber");

-- CreateIndex
CREATE INDEX "ContractorContract_mineId_status_startDate_endDate_idx" ON "ContractorContract"("mineId", "status", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "ContractorContract_companyId_status_idx" ON "ContractorContract"("companyId", "status");

-- CreateIndex
CREATE INDEX "ContractorContract_contractorId_status_idx" ON "ContractorContract"("contractorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorContract_companyId_contractNumber_key" ON "ContractorContract"("companyId", "contractNumber");

-- CreateIndex
CREATE INDEX "ContractorWorker_contractorId_status_idx" ON "ContractorWorker"("contractorId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorWorker_contractorId_employeeCode_key" ON "ContractorWorker"("contractorId", "employeeCode");

-- CreateIndex
CREATE INDEX "ContractorWorkerAssignment_mineId_status_idx" ON "ContractorWorkerAssignment"("mineId", "status");

-- CreateIndex
CREATE INDEX "ContractorWorkerAssignment_contractId_status_idx" ON "ContractorWorkerAssignment"("contractId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorWorkerAssignment_workerId_contractId_mineId_key" ON "ContractorWorkerAssignment"("workerId", "contractId", "mineId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_contractorWorkerId_key" ON "Worker"("contractorWorkerId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- CreateIndex
CREATE INDEX "Worker_companyId_employmentType_status_idx" ON "Worker"("companyId", "employmentType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_companyId_employeeCode_key" ON "Worker"("companyId", "employeeCode");

-- CreateIndex
CREATE INDEX "AttendanceRecord_mineId_businessDate_idx" ON "AttendanceRecord"("mineId", "businessDate");

-- CreateIndex
CREATE INDEX "AttendanceRecord_workerId_businessDate_idx" ON "AttendanceRecord"("workerId", "businessDate");

-- CreateIndex
CREATE INDEX "AttendanceRecord_companyId_businessDate_idx" ON "AttendanceRecord"("companyId", "businessDate");

-- CreateIndex
CREATE INDEX "AttendanceRecord_mineId_isOpen_idx" ON "AttendanceRecord"("mineId", "isOpen");

-- CreateIndex
CREATE INDEX "AttendanceRecord_workerId_isOpen_idx" ON "AttendanceRecord"("workerId", "isOpen");

-- CreateIndex
CREATE INDEX "Grievance_companyId_status_idx" ON "Grievance"("companyId", "status");

-- CreateIndex
CREATE INDEX "Grievance_mineId_status_idx" ON "Grievance"("mineId", "status");

-- CreateIndex
CREATE INDEX "Grievance_reporterId_status_idx" ON "Grievance"("reporterId", "status");

-- CreateIndex
CREATE INDEX "Grievance_slaDueAt_status_idx" ON "Grievance"("slaDueAt", "status");

-- CreateIndex
CREATE INDEX "Grievance_priority_idx" ON "Grievance"("priority");

-- CreateIndex
CREATE INDEX "GrievanceComment_grievanceId_visibility_idx" ON "GrievanceComment"("grievanceId", "visibility");

-- CreateIndex
CREATE INDEX "GrievanceStatusHistory_grievanceId_createdAt_idx" ON "GrievanceStatusHistory"("grievanceId", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_uploadedById_idx" ON "Attachment"("uploadedById");

-- CreateIndex
CREATE INDEX "Attachment_fileHash_idx" ON "Attachment"("fileHash");

-- CreateIndex
CREATE INDEX "Attachment_companyId_idx" ON "Attachment"("companyId");

-- CreateIndex
CREATE INDEX "Attachment_mineId_idx" ON "Attachment"("mineId");

-- CreateIndex
CREATE INDEX "OcrJob_status_createdAt_idx" ON "OcrJob"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OcrJob_requestedById_idx" ON "OcrJob"("requestedById");

-- CreateIndex
CREATE INDEX "OcrJob_attachmentId_engineVersion_idx" ON "OcrJob"("attachmentId", "engineVersion");

-- CreateIndex
CREATE UNIQUE INDEX "OcrExtraction_jobId_key" ON "OcrExtraction"("jobId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_sequence_idx" ON "AuditLog"("entityType", "entityId", "sequence");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_mineId_occurredAt_idx" ON "AuditLog"("companyId", "mineId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_occurredAt_idx" ON "AuditLog"("actorId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditLog_hmacHash_idx" ON "AuditLog"("hmacHash");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_sequence_key" ON "AuditLog"("sequence");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mine" ADD CONSTRAINT "Mine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMineAssignment" ADD CONSTRAINT "UserMineAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMineAssignment" ADD CONSTRAINT "UserMineAssignment_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMineAssignment" ADD CONSTRAINT "UserMineAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionTemplate" ADD CONSTRAINT "InspectionTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionTemplate" ADD CONSTRAINT "InspectionTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "InspectionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_conductedById_fkey" FOREIGN KEY ("conductedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_complianceRequirementId_fkey" FOREIGN KEY ("complianceRequirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_complianceRecordId_fkey" FOREIGN KEY ("complianceRecordId") REFERENCES "ComplianceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_complianceRequirementId_fkey" FOREIGN KEY ("complianceRequirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_complianceRecordId_fkey" FOREIGN KEY ("complianceRecordId") REFERENCES "ComplianceRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Violation" ADD CONSTRAINT "Violation_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_violationId_fkey" FOREIGN KEY ("violationId") REFERENCES "Violation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskScore" ADD CONSTRAINT "RiskScore_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyFlag" ADD CONSTRAINT "AnomalyFlag_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyFlag" ADD CONSTRAINT "AnomalyFlag_relatedRiskScoreId_fkey" FOREIGN KEY ("relatedRiskScoreId") REFERENCES "RiskScore"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnomalyFlag" ADD CONSTRAINT "AnomalyFlag_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contractor" ADD CONSTRAINT "Contractor_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorContract" ADD CONSTRAINT "ContractorContract_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorContract" ADD CONSTRAINT "ContractorContract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorContract" ADD CONSTRAINT "ContractorContract_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorContract" ADD CONSTRAINT "ContractorContract_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorWorker" ADD CONSTRAINT "ContractorWorker_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorWorkerAssignment" ADD CONSTRAINT "ContractorWorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "ContractorWorker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorWorkerAssignment" ADD CONSTRAINT "ContractorWorkerAssignment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "ContractorContract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorWorkerAssignment" ADD CONSTRAINT "ContractorWorkerAssignment_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_contractorWorkerId_fkey" FOREIGN KEY ("contractorWorkerId") REFERENCES "ContractorWorker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceComment" ADD CONSTRAINT "GrievanceComment_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceComment" ADD CONSTRAINT "GrievanceComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceStatusHistory" ADD CONSTRAINT "GrievanceStatusHistory_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES "Grievance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrievanceStatusHistory" ADD CONSTRAINT "GrievanceStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_mineId_fkey" FOREIGN KEY ("mineId") REFERENCES "Mine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcrJob" ADD CONSTRAINT "OcrJob_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcrExtraction" ADD CONSTRAINT "OcrExtraction_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "OcrJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcrExtraction" ADD CONSTRAINT "OcrExtraction_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

