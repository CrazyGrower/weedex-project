import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Strain from './strain.js'

export default class GrowLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare strain_id: number

  @column()
  declare name: string

  @column.date()
  declare start_date: DateTime

  @column.date()
  declare end_date: DateTime | null

  @column()
  declare harvest_amount: number | null

  @column()
  declare review_rating: number | null

  @column()
  declare notes: string | null

  @column()
  declare pdf_path: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Strain, {
    foreignKey: 'strain_id'  // Spécifier explicitement le nom de la clé étrangère
  })
  declare strain: BelongsTo<typeof Strain>
}