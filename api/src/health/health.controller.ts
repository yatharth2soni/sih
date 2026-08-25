import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('info')
  info() {
    return {
      version: '0.1.0',
      name: 'CoalMine Governance API',
    };
  }
}
