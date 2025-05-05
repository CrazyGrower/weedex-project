import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class GrowLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare strain_id: number

  @column()
  declare date: DateTime

  @column()
  declare notes: string

  @column()
  declare yield: number

  @column()
  declare pdf_path: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
} 