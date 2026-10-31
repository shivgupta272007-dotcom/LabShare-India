// ============================================================
// LabShare – Global HTTP Exception Filter
// Enforces standard error format:
// { error: { code, message, details[], requestId } }
// ============================================================

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { randomUUID } from 'node:crypto'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const requestId = (request.headers['x-request-id'] as string) || randomUUID()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let code = 'INTERNAL_SERVER_ERROR'
    let message = 'An unexpected error occurred. Please contact support.'
    let details: any[] = []

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const res: any = exception.getResponse()

      if (typeof res === 'string') {
        message = res
      } else if (typeof res === 'object' && res !== null) {
        message = res.message || exception.message
        code = res.error || res.code || HttpStatus[status]
        if (Array.isArray(res.message)) {
          details = res.message
          message = 'Validation failed'
          code = 'VALIDATION_ERROR'
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message
      code = exception.name || 'ERROR'
    }

    response.setHeader('X-Request-Id', requestId)
    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    })
  }
}
