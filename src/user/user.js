require( 'dotenv' ).config();
const knex = require( 'knex' );
const UserService = require( './user-service' );

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

console.log( UserService.getAllUsers() );