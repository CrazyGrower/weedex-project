import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import GrowLog from './grow_log.js'

export default class Strain extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare number: string

  @column()
  declare name: string

  @column()
  declare brand: string

  @column()
  declare image_path: string | null

  @column()
  declare thumbnail_path: string | null

  @column()
  declare description: string

  @column()
  declare seed_to_harvest: number

  @column()
  declare type: string

  @column()
  declare thc_percentage: number

  @column()
  declare average_yield: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => GrowLog, {
    foreignKey: 'strain_id'  // Spécifier explicitement le nom de la clé étrangère
  })
  declare growLogs: HasMany<typeof GrowLog>
}