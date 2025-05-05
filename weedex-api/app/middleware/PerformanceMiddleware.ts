import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { LoggerService } from '../services/LoggerService'

export default class PerformanceMiddleware {
  private logger: LoggerService

  constructor() {
    this.logger = new LoggerService(use('Logger'))
  }

  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const start = process.hrtime()

    await next()

    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = seconds * 1000 + nanoseconds / 1000000

    response.header('x-response-time', `${duration.toFixed(2)}ms`)

    this.logger.logPerformance('request_duration', duration, {
      method: request.method(),
      url: request.url(),
      status: response.getStatus().toString()
    })
  }
} 