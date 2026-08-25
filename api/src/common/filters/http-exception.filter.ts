import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let errorResponse: ErrorResponse;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        errorResponse = {
          error: {
            code: this.statusToCode(status),
            message: exResponse,
          },
        };
      } else if (typeof exResponse === 'object' && exResponse !== null) {
        const resp = exResponse as Record<string, unknown>;
        errorResponse = {
          error: {
            code: (resp['code'] as string) || this.statusToCode(status),
            message:
              (resp['message'] as string) ||
              (Array.isArray(resp['message'])
                ? (resp['message'] as string[]).join('; ')
                : exception.message),
            details: resp['details'] as Record<string, unknown> | undefined,
          },
        };
      } else {
        errorResponse = {
          error: {
            code: this.statusToCode(status),
            message: exception.message,
          },
        };
      }
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (exception.code === 'P2002') {
        status = HttpStatus.BAD_REQUEST;
        const target = (exception.meta?.target as string[]) || [];
        errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: `Unique constraint violation on field(s): ${target.join(', ')}`,
            details: { prismaCode: exception.code, target },
          },
        };
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        errorResponse = {
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
          },
        };
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse = {
          error: {
            code: 'INTERNAL_ERROR',
            message: 'A database error occurred',
          },
        };
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      };
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json(errorResponse);
  }

  private statusToCode(status: number): string {
    switch (status) {
      case 400:
        return 'VALIDATION_ERROR';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
