import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { MockOcrAdapter } from './mock-ocr.adapter';
import { ScopeService } from '../common/services/scope.service';

@Module({
  controllers: [OcrController],
  providers: [OcrService, MockOcrAdapter, ScopeService],
  exports: [OcrService, MockOcrAdapter],
})
export class OcrModule {}
