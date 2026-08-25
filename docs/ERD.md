# Entity Relationship Diagram (ERD) — CoalMine Governance Database

```mermaid
erDiagram
    Company ||--o{ User : "employs"
    Company ||--o{ Mine : "operates"
    Company ||--o{ RiskScore : "scoped_to"
    Company ||--o{ Contractor : "engages"
    Company ||--o{ ContractorContract : "issues"
    Company ||--o{ Worker : "employs/contracts"
    Company ||--o{ AttendanceRecord : "tracks_shifts"
    Company ||--o{ Grievance : "scoped_to"
    Company ||--o{ Attachment : "owns"
    
    User ||--o{ RefreshToken : "holds"
    User ||--o{ UserMineAssignment : "assigned"
    User ||--o{ Notification : "receives"
    User ||--o{ AnomalyFlag : "actions"
    User ||--o{ ContractorContract : "creates"
    User ||--o| Worker : "linked_profile"
    User ||--o{ AttendanceRecord : "recorded_by"
    User ||--o{ Grievance : "reports/assigned"
    User ||--o{ GrievanceComment : "authors"
    User ||--o{ GrievanceStatusHistory : "transitions"
    User ||--o{ Attachment : "uploads"
    User ||--o{ OcrJob : "requests"
    User ||--o{ OcrExtraction : "reviews"
    User ||--o{ AuditLog : "authors_events"
    
    Mine ||--o{ UserMineAssignment : "assigned_to"
    Mine ||--o{ ComplianceRecord : "tracks"
    Mine ||--o{ Inspection : "conducts"
    Mine ||--o{ Violation : "logs"
    Mine ||--o{ RiskScore : "evaluates"
    Mine ||--o{ AnomalyFlag : "detects"
    Mine ||--o{ ContractorContract : "hosts"
    Mine ||--o{ ContractorWorkerAssignment : "assigns_worker"
    Mine ||--o{ AttendanceRecord : "site_shifts"
    Mine ||--o{ Grievance : "site_grievance"
    Mine ||--o{ Attachment : "site_attachments"
    
    Contractor ||--o{ ContractorContract : "holds"
    Contractor ||--o{ ContractorWorker : "employs"
    ContractorContract ||--o{ ContractorWorkerAssignment : "places"
    ContractorWorker ||--o{ ContractorWorkerAssignment : "assigned_to"
    ContractorWorker ||--o| Worker : "unified_profile"

    Worker ||--o{ AttendanceRecord : "logs_attendance"

    Grievance ||--o{ GrievanceComment : "has_comments"
    Grievance ||--o{ GrievanceStatusHistory : "audit_history"

    Attachment ||--o{ OcrJob : "processed_by"
    OcrJob ||--o| OcrExtraction : "generates"

    AuditLog {
        string id PK
        int sequence UK "monotonic sequence"
        datetime occurredAt
        string actorId FK_nullable
        string action
        string entityType
        string entityId
        string companyId
        string mineId
        json beforeSummary
        json afterSummary
        json metadata
        string prevHash "HMAC-SHA-256 link"
        string payloadHash "SHA-256 canonical"
        string hmacHash "HMAC-SHA-256 signature"
        string chainVersion
    }
```
