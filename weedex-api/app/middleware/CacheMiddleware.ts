import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Redis from '@ioc:Adonis/Addons/Redis'

export default class CacheMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const key = `cache:${request.url()}`
    const cachedResponse = await Redis.get(key)

    if (cachedResponse) {
      return response.json(JSON.parse(cachedResponse))
    }

    await next()

    // Cache la réponse si elle est réussie
    if (response.getStatus() === 200) {
      const responseBody = response.getBody()
      if (responseBody) {
        await Redis.setex(key, 3600, JSON.stringify(responseBody)) // Cache pour 1 heure
      }
    }
  }
} 