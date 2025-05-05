import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'grow_logs'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('strain_id').unsigned().references('id').inTable('strains').onDelete('CASCADE')
      table.string('name').notNullable()
      table.date('start_date').notNullable()
      table.date('end_date').nullable()
      table.decimal('harvest_amount', 8, 2).nullable()
      table.integer('review_rating').unsigned().nullable()
      table.text('notes').nullable()
      table.string('pdf_path').nullable()
      table.string('growlog_url').nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}