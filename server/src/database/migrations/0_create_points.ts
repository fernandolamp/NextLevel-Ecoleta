import Knex from 'knex'

const table_name = 'points';
export async function up(knex: Knex) {
   return knex.schema.createTable(table_name, table => {
       table.increments('id').primary();
       table.string('image').notNullable();
       table.string('name').notNullable();
       table.string('email').notNullable();
       table.string('whatsapp').notNullable();
       table.decimal('longitude').notNullable();
       table.decimal('latitude').notNullable();       
       table.string('city').notNullable();
       table.string('uf',2).notNullable()
   })        
}

export async function down(knex: Knex){
    return knex.schema.dropTable(table_name);
    

}