const knex = require( 'knex' );
const app = require( './app' );
const { PORT, DB_URL } = require( './config' );

const db = knex({
  client: 'pg',
  connection: DB_URL,
});

app.set( 'db', db );

app.get( '/api/*', ( req, res ) => {
  res.json({ ok: true });
});

app.listen( PORT, () => {
  console.log( `Server listening at http://localhost:${ PORT }` );
});

module.exports = { app };