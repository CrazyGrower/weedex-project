import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'strains'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable()
      table.string('brand').notNullable()
      table.string('image_path').nullable()
      table.text('description').nullable()
      table.integer('seed_to_harvest').nullable()
      table.string('type').nullable()
      table.decimal('thc_percentage', 5, 2).nullable()
      table.decimal('average_yield', 8, 2).nullable()
      table.decimal('strain_review', 3, 1).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}