import type { CorsConfig } from '@adonisjs/cors/types'

const corsConfig: CorsConfig = {
  enabled: true,
  origin: true, // Accepter toutes les origines en développement
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: true, // Accepter tous les headers
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
}

export default corsConfig