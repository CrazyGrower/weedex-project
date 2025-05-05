import { Logger } from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class LoggerService {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  public logRequest(ctx: HttpContextContract) {
    const { request, response } = ctx
    const duration = response.getHeader('x-response-time')
    const status = response.getStatus()

    this.logger.info({
      type: 'request',
      method: request.method(),
      url: request.url(),
      status,
      duration,
      ip: request.ip(),
      userAgent: request.header('user-agent'),
      userId: ctx.auth?.user?.id
    })
  }

  public logError(error: any, ctx?: HttpContextContract) {
    this.logger.error({
      type: 'error',
      message: error.message,
      stack: error.stack,
      code: error.code,
      request: ctx ? {
        method: ctx.request.method(),
        url: ctx.request.url(),
        ip: ctx.request.ip()
      } : undefined
    })
  }

  public logPerformance(metric: string, value: number, tags: Record<string, string> = {}) {
    this.logger.info({
      type: 'performance',
      metric,
      value,
      ...tags
    })
  }
} 