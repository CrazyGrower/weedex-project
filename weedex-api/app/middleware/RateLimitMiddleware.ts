import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class RateLimitMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const ip = request.ip()
    const key = `ratelimit:${ip}`
    const current = await Redis.incr(key)

    if (current === 1) {
      await Redis.expire(key, 60) // Reset après 60 secondes
    }

    if (current > 100) { // 100 requêtes par minute
      return response.status(429).json({
        error: 'Too many requests',
        retryAfter: await Redis.ttl(key)
      })
    }

    await next()
  }
} 