import Knex from 'knex'

const table_name = 'items';
export async function up(knex: Knex) {

    return knex.schema.createTable(table_name, table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    })        
 }

export async function down(knex: Knex){
    return knex.schema.dropTable(table_name);
}