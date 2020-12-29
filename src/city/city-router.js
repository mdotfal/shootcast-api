const express = require( 'express' );

const cityRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require( 'uuid' );
const logger = require( '../logger' );

const { cities } = require( '../store' );

cityRouter
  .route( '/city' )
  .get( ( req, res ) => {
    res.json( cities );
  })
  .post( bodyParser, ( req, res ) => {
    const { listId, name } = req.body;
    if( !name ) {
      logger.error( `Name is required` );
      return res
        .status( 400 )
        .send( `Invalid Name Data` );
    }
    if( !listId ) {
      logger.error( `listId is required` );
      return res
        .status( 400 )
        .send( `Invalid listId Data` );
    }
    const id = uuid();
    const city = {
      id,
      name,
      listId
    };
    cities.push( city );
    logger.info( `City with id ${ id } created`)
    res
      .status( 201 )
      .location( `http://localhost:8000/city/${ id }` )
      .json({ id });
  });

cityRouter
  .route( '/city/:cityId' )
  .get( ( req, res ) => {
    const { cityId } = req.params;
    const city = cities.find( c => c.id == cityId );
    if( !city ) {
      logger.error( `City with id ${ cityId } not found` );
      return res
        .status( 404 )
        .send( `City Not Found` );
    }
    res.json( city );
  })
  .delete( ( req, res ) => {
    const { cityId } = req.params;
    const cityIndex = cities.findIndex( c => c.id == cityId );
    if( cityIndex === -1 ) {
      logger.error( `Card with id ${ cityId } not found` );
      return res 
        .status( 404 )
        .send( `Not found` );
    }
    cities.splice( cityIndex, 1 );
    logger.info( `Card with id ${ cityId } deleted` );
    res
      .status( 204 )
      .end();
  });

module.exports = cityRouter;