# API Manual Tests — curl Examples

Base URL: `http://localhost:4000/api/v1`

---

## 1. Multilingual Governed Conversational Data Interface

### English Safety Risk Query
```bash
curl -X POST "http://localhost:4000/api/v1/assistant/query" \
  -H "Authorization: Bearer <OFFICIAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the safety risk score for Jharia Block-4?"
  }'
```

### Hindi Statutory Compliance Query (Devanagari)
```bash
curl -X POST "http://localhost:4000/api/v1/assistant/query" \
  -H "Authorization: Bearer <OFFICIAL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "झरिया खदान की वैधानिक अनुपालन स्थिति क्या है?"
  }'
```

### Capabilities & Scope Introspection
```bash
curl -X GET "http://localhost:4000/api/v1/assistant/capabilities" \
  -H "Authorization: Bearer <OFFICIAL_TOKEN>"
```
