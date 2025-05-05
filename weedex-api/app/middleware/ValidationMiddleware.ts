import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class ValidationMiddleware {
  private validationSchemas = {
    createUser: schema.create({
      email: schema.string({}, [
        rules.email(),
        rules.unique({ table: 'users', column: 'email' })
      ]),
      password: schema.string({}, [
        rules.minLength(8),
        rules.maxLength(32)
      ]),
      name: schema.string({}, [
        rules.minLength(2),
        rules.maxLength(50)
      ])
    }),
    // Ajoutez d'autres schémas de validation ici
  }

  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const routeName = request.route?.name
    if (routeName && this.validationSchemas[routeName]) {
      try {
        await request.validate({
          schema: this.validationSchemas[routeName]
        })
      } catch (error) {
        return response.status(422).json({
          errors: error.messages
        })
      }
    }

    await next()
  }
} 