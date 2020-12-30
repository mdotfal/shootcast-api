require( 'dotenv').config();
const express = require( 'express' );
const morgan = require( 'morgan' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const { NODE_ENV, CLIENT_ORIGIN } = require( './config');
const listRouter = require( './list/list-router' );
const ListsService = require( './list/list-service' );
const cityRouter = require( './city/city-router' ); 
// const userRouter = require( './user/user-router' );
const logger = require( './logger' );

const app = express();
// const jsonParser = express.json();

const morganOption = ( NODE_ENV === 'production' )
  ? 'tiny'
  : 'common';

app.use( morgan( morganOption ));
app.use( helmet() );
app.use( 
  cors({
    origin: CLIENT_ORIGIN
  })
);
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

// app.use( userRouter );
app.use( listRouter );
app.use( cityRouter );

/***********  GET  ***********/

app.get( '/', ( req, res ) => {
  res.send( 'Hello, world!' )
});

app.get( '/xss', ( req, res ) => {
  res.cookie( 'secretToken', '1234567890' );
  res.sendFile( __dirname + '/xss-example.html' );
});

/***********  POST  ***********/

// app.use( function validateBearerToken( req, res, next ) {
//   const apiToken = process.env.API_TOKEN;
//   const authToken = req.get( 'Authorization' );

//   if ( !authToken || authToken.split(' ')[ 1 ] !== apiToken ) {
//     logger.error(`Unauthorized request to path: ${req.path}`);
//     return res.status( 401 ).json({ error: 'Unauthorized request' });
//   }
//   // move to the next middleware
//   next();
// })

module.exports = app;
