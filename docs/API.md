# API Reference — CoalMine Governance API

Base URL: `http://localhost:4000/api/v1`

---

## 1. Multilingual Governed Conversational Data Interface

### `POST /assistant/query`
**Auth:** Bearer JWT (`ADMIN`, `REGULATOR`, `CORPORATE`, `MINE_OFFICIAL`)
**Request Body:**
- `question` (string, required, length: 3..500)
- `language` (string, optional: `'en'` | `'hi'`, default: auto-detected)
- `mineId` (UUID, optional)
- `companyId` (UUID, optional)
- `from`, `to` (DateString, optional)

```json
// Request
{
  "question": "What is the safety risk score for Jharia Block-4?",
  "language": "en",
  "mineId": "95c69208-19dc-4002-bf80-667455e59123"
}

// Response 200 OK
{
  "data": {
    "answer": "**Jharia Block-4** currently has a safety Risk Score of **78 / 100** (CRITICAL). There are **1 active anomaly flag(s)** detected requiring management attention.",
    "language": "en",
    "intent": "MINE_RISK",
    "dataAsOf": "2026-08-25T22:45:00.000Z",
    "citations": [
      { "resourceType": "Mine", "resourceId": "95c69208-19dc-4002-bf80-667455e59123", "label": "Jharia Block-4 (BCCL-JHA-BLK4)" },
      { "resourceType": "RiskScore", "resourceId": "uuid", "label": "Risk Score: 78 (CRITICAL) [v1.0.0]" }
    ],
    "limitations": [
      "Risk score is calculated deterministically based on rolling 30/90 day weighted violations, open CAPAs, and grievances."
    ],
    "disclaimer": "Informational governance summary only; does not replace statutory regulatory reporting, official certification, or legal compliance orders under the Mines Act 1952 / CMR 2017.",
    "provider": "deterministic"
  }
}
```

### `GET /assistant/capabilities`
**Auth:** Bearer JWT (`ADMIN`, `REGULATOR`, `CORPORATE`, `MINE_OFFICIAL`)
```json
// Response 200 OK
{
  "data": {
    "supportedLanguages": ["en", "hi"],
    "supportedIntents": [
      { "intent": "MINE_RISK", "description": "Mine safety risk scores, risk bands, and active anomaly spikes" },
      { "intent": "COMPLIANCE_STATUS", "description": "Statutory compliance rates, compliant vs overdue records" },
      { "intent": "OVERDUE_CAPA", "description": "Open and overdue Corrective and Preventive Actions (CAPA)" },
      { "intent": "RECENT_VIOLATIONS", "description": "Active safety violations and severity levels" },
      { "intent": "GRIEVANCE_SUMMARY", "description": "Grievance counts by status (open, in progress, escalated, resolved)" },
      { "intent": "HELP_CAPABILITIES", "description": "Assistant commands and help guide" }
    ],
    "filterParameters": ["mineId", "companyId", "from", "to"],
    "rateLimit": "10 requests per minute per IP/user",
    "maxQuestionLength": 500,
    "privacyPolicy": "Zero chat retention by default. Data queries are strictly scoped to authenticated user permissions. Natural language is never converted into arbitrary SQL.",
    "disclaimer": "Informational governance summary only; does not replace statutory regulatory reporting or official certification."
  }
}
```
