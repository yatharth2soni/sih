# Seeded Users & Demo Scenarios — Khanan Suraksha

Default password for all users: `Test@1234`

## 1. Seeded Users

| Name | Email | Role | Company / Jurisdiction | Scope / Assigned Mines |
|---|---|---|---|---|
| Admin User | `admin@coalmine.gov.in` | `ADMIN` | Global (Ministry of Coal) | All companies, mines, audits, reports, grievances, OCR jobs, audit logs |
| DGMS Regulator | `regulator@dgms.gov.in` | `REGULATOR` | DGMS National Oversight | Statutory cross-company overviews, compliance monitoring, audit chain verification |
| Corporate User | `corporate@coalindia.gov.in` | `CORPORATE` | Bharat Coking Coal Limited (BCCL) | Scoped to all BCCL mines (Jharia & Korba) and BCCL audit entries |
| R. Mahapatra | `r.mahapatra@coalindia.gov.in` | `MINE_OFFICIAL` | BCCL | Assigned to **Jharia Block-4** & **Korba West Pit-2** |

---

## 2. Seeded Genesis Audit Trail (Phase 11 Demo)

| Sequence | Action | Entity Type / ID | Context |
|---|---|---|---|
| `#1` | `COMPLIANCE_REQUIREMENTS_INITIALIZED` | `System` / `dgms-statutory-baseline` | Genesis block with `prevHash: 0000...0000` |
| `#2` | `MINE_GOVERNANCE_CONFIGURED` | `Mine` / `BCCL-JHA-BLK4` | Chained link to `#1` HMAC signature |
| `#3` | `INSPECTION_CONDUCTED` | `Inspection` / `insp-seed-01` | Chained link to `#2` HMAC signature |
| `#4` | `VIOLATION_ELEVATED` | `Violation` / `viol-seed-01` | Chained link to `#3` HMAC signature |
| `#5` | `GRIEVANCE_RESOLVED` | `Grievance` / `grv-demo-resolved-02` | Head of chain linked to `#4` HMAC signature |
