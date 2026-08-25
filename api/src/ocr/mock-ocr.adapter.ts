import { Injectable, Logger } from '@nestjs/common';

export interface OcrEngineResult {
  rawText: string;
  confidence: number;
  fields: Record<string, { value: any; confidence: number; span: string }>;
}

@Injectable()
export class MockOcrAdapter {
  private readonly logger = new Logger(MockOcrAdapter.name);

  readonly engineName = 'mock-ocr-v1';
  readonly engineVersion = '1.0.0';

  async processDocument(
    fileName: string,
    mimeType: string,
    languageHints?: string[],
  ): Promise<OcrEngineResult> {
    this.logger.log(`Processing document "${fileName}" with MockOcrAdapter (languages: ${languageHints?.join(',') || 'default'})`);

    // Simulate OCR failure for test fixtures
    if (fileName.toLowerCase().includes('corrupt') || fileName.toLowerCase().includes('fail')) {
      throw new Error('OCR_CORRUPTED_DOCUMENT: Unreadable raster image stream or corrupted header');
    }

    const lower = fileName.toLowerCase();

    if (lower.includes('form-iv-b') || lower.includes('ohs') || lower.includes('safety-return')) {
      return {
        rawText: `DIRECTORATE GENERAL OF MINES SAFETY\nFORM IV-B (See Rule 21(1))\nQuarter Ending June 2026\nAverage Daily Employment: 1420\nFatalities during quarter: NIL (0)\nSerious Bodily Injuries: 1\nPit Safety Committee Meetings Held: 3\nStatutory Compliance Status: Fully Certified`,
        confidence: 0.95,
        fields: {
          formType: { value: 'Form IV-B', confidence: 0.98, span: 'FORM IV-B (See Rule 21(1))' },
          reportingPeriod: { value: 'Q2-2026', confidence: 0.95, span: 'Quarter Ending June 2026' },
          averageDailyEmployment: { value: 1420, confidence: 0.92, span: 'Average Daily Employment: 1420' },
          fatalAccidents: { value: 0, confidence: 0.99, span: 'Fatalities during quarter: NIL (0)' },
          seriousInjuries: { value: 1, confidence: 0.94, span: 'Serious Bodily Injuries: 1' },
          safetyCommitteeMeetings: { value: 3, confidence: 0.96, span: 'Pit Safety Committee Meetings Held: 3' },
          complianceStatus: { value: 'COMPLIANT', confidence: 0.97, span: 'Statutory Compliance Status: Fully Certified' },
        },
      };
    }

    if (lower.includes('air-quality') || lower.includes('env') || lower.includes('pm10')) {
      return {
        rawText: `ENVIRONMENTAL MONITORING REPORT\nStandard: MoEFCC Ambient Air Quality Standards 2009\nDate of Monitoring: 10-Aug-2026\nSampling Point: Core Zone Haul Road Gate-1\nPM10: 88 ug/m3 (Statutory Limit: 100 ug/m3)\nPM2.5: 42 ug/m3 (Statutory Limit: 60 ug/m3)\nSO2: 18 ug/m3\nNOx: 24 ug/m3\nVerdict: Meets Statutory Prescribed Limits`,
        confidence: 0.94,
        fields: {
          standard: { value: 'MoEFCC Ambient Air Quality Standards 2009', confidence: 0.98, span: 'MoEFCC Ambient Air Quality Standards 2009' },
          samplingDate: { value: '2026-08-10', confidence: 0.95, span: 'Date of Monitoring: 10-Aug-2026' },
          pm10: { value: '88 ug/m3', confidence: 0.93, span: 'PM10: 88 ug/m3 (Statutory Limit: 100 ug/m3)' },
          pm25: { value: '42 ug/m3', confidence: 0.91, span: 'PM2.5: 42 ug/m3 (Statutory Limit: 60 ug/m3)' },
          complianceStatus: { value: 'COMPLIANT', confidence: 0.99, span: 'Verdict: Meets Statutory Prescribed Limits' },
        },
      };
    }

    // Default structured document result
    return {
      rawText: `MINING STATUTORY CERTIFICATE\nDocument: ${fileName}\nDigitized at: ${new Date().toISOString()}\nStatus: Verified and extracted`,
      confidence: 0.91,
      fields: {
        documentName: { value: fileName, confidence: 0.99, span: fileName },
        extractedTimestamp: { value: new Date().toISOString(), confidence: 0.95, span: 'Digitized timestamp' },
        generalCompliance: { value: 'VERIFIED', confidence: 0.88, span: 'Status: Verified and extracted' },
      },
    };
  }
}
