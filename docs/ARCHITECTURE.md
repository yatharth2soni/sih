# Architecture — CoalMine Governance API

## Overview

The backend is a **NestJS** REST API serving the Khanan Suraksha platform. It provides authentication, organizational data (companies & mines), statutory compliance monitoring, operational inspections/CAPA, automated notifications/escalations, read-optimized dashboard aggregation & reporting, explainable risk scoring & anomaly detection, contractor management, worker attendance rosters, confidential grievance handling, OCR-assisted document digitization with practical GIS spatial analysis, a hash-chained tamper-evident audit trail, and a **Multilingual, Governed Conversational Data Interface** under `/api/v1`.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24+ |
| Framework | NestJS 10 (Express adapter) |
| Language | TypeScript 5, strict mode |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT access tokens + opaque refresh tokens (bcrypt + sha256) |
| Validation | class-validator + class-transformer |
| Security | helmet, CORS, @nestjs/throttler, formula injection sanitization, privacy hashing, comment visibility tiers, prompt injection defense |
| Cryptography | SHA-256 canonical payload hashing + HMAC-SHA-256 hash-chaining |
| Reporting | exceljs, native RFC 4180 CSV generation |
| Spatial GIS | Application-level 2D Ray-Casting Point-in-Polygon & Haversine Great-Circle math over GeoJSON |
| OCR Engine | Pluggable MockOcrAdapter with field-level confidence scoring, source spans, and human review loop |
| Assistant | Deterministic intent classification with bilingual English & Hindi support and resource citations |
| Timezone | Indian Standard Time (`Asia/Kolkata`, UTC+5:30) for business dates and SLAs |
| Testing | Jest + supertest |

## Module Architecture

```
AppModule
├── ConfigModule (global)
├── ThrottlerModule (global rate limiter)
├── PrismaModule (global DB client)
├── AuthModule (/auth/login, /auth/refresh, /auth/logout)
├── CompaniesModule (/companies)
├── MinesModule (/mines, /mines/nearby, /mines/:id/location-context)
├── ComplianceModule (/compliance/requirements, /mines/:mineId/compliance/records)
├── InspectionsModule (/inspections, /inspections/templates)
├── ObservationsModule (/inspections/:id/observations, /observations/:id)
├── ViolationsModule (/observations/:id/violation, /violations)
├── CorrectiveActionsModule (/violations/:id/corrective-actions, /corrective-actions)
├── NotificationsModule (/notifications, /notifications/unread-count, /notifications/:id/read, /notifications/read-all)
├── AlertsModule (global) (/alerts/escalations, /alerts/trigger-scan)
├── DashboardModule (/dashboard/mine/:id, /dashboard/company/:id, /dashboard/regulator)
├── ReportsModule (/reports/compliance, /reports/statutory/export)
├── RiskScoringModule (/risk-scores, /mines/:mineId/risk-score, /risk-scores/recalculate, /anomalies)
├── ContractorsModule (/contractors, /contractor-contracts, /mines/:mineId/contractors)
├── AttendanceModule (/attendance/check-in, /attendance/:id/check-out, /attendance, /attendance/summary, /workers)
├── GrievancesModule (/grievances, /grievances/:id/comments, /grievances/:id/assign, /grievances/:id/start, /escalate, /resolve, /close, /reopen)
├── OcrModule (/ocr/jobs, /ocr/jobs/:id, /ocr/jobs/:id/extraction, /ocr/jobs/:id/review, /ocr/jobs/:id/retry)
├── AuditModule (/audit-logs, /audit-logs/verify, /audit-logs/entity/:type/:id)
├── AssistantModule (/assistant/query, /assistant/capabilities)
└── HealthController (/health, /info — public)
```

---

## Conversational Interface Architecture

### 1. Zero Direct Database Generation Policy
- User natural language is **never** converted into arbitrary SQL or dynamic Prisma queries.
- Queries are classified into allowlisted structured intents (`COMPLIANCE_STATUS`, `OVERDUE_CAPA`, `RECENT_VIOLATIONS`, `MINE_RISK`, `GRIEVANCE_SUMMARY`, `HELP_CAPABILITIES`, `UNKNOWN`).
- Domain data is fetched strictly through authenticated, scoped server services.

### 2. Prompt Injection Defense & Privacy Guarantees
- Untrusted user text cannot alter server scopes, bypass authorization, or reveal system prompts/secrets.
- Zero raw chat data persistence: conversations are ephemeral and not retained in permanent storage.
- Statutory informational disclaimer attached to every response.
