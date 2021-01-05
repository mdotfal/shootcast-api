require( 'dotenv').config();
const express = require( 'express' );
const morgan = require( 'morgan' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const { NODE_ENV } = require( './config');
const listRouter = require( './list/list-router' );
const ListsService = require( './list/list-service' );
const cityRouter = require( './city/city-router' ); 
const logger = require( './logger' );

const app = express();


const morganOption = ( NODE_ENV === 'production' )
  ? 'tiny'
  : 'common';

app.use( morgan( morganOption ));
app.use( helmet() );
app.use( cors() );
app.use( express.json() );

app.use( errorHandler = ( error, req, res, next) => {
  let response;
  if( NODE_ENV === 'production' ) {
    response = { error: { message: 'server error' }};
  } else {
    console.log( error );
    response = { message: error.message, error };
  }
  res.status( 500 ).json( response );
});

app.use( '/api', listRouter );
app.use( '/api', cityRouter );

/***********  GET  ***********/

app.get( '/xss', ( req, res ) => {
  res.cookie( 'secretToken', '1234567890' );
  res.sendFile( __dirname + '/xss-example.html' );
});

module.exports = app;
