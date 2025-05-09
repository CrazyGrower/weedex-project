import type { CorsConfig } from '@adonisjs/cors/types'

const corsConfig: CorsConfig = {
  enabled: true,
  origin: ['https://frontend.weedex-project.orb.local'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  headers: true, // Accepter tous les headers
  exposeHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 90,
}

export default corsConfig