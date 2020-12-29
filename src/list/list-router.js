const express = require( 'express' );

const listRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require( 'uuid' );
const logger = require( '../logger' );

const { lists } = require( '../store' );

listRouter
  .route( '/list' )
  .get( ( req, res ) => {
    res.json( lists );
  })
  .post( bodyParser, ( req, res ) => {
    const { name } = req.body;
    if( !name ) {
      logger.error( `Name is required` );
      return res
        .status( 400 )
        .send( `Invalid name data` );
    }
    const id = uuid();
    const list = {
      id, 
      name
    };
    lists.push( list );
    logger.info( `List with id ${ id } created` );
    res
      .status( 201 )
      .location( `http://localhost:8000/list/${ id }` )
      .json( list );
  });

listRouter
  .route( '/list/:listId' )
  .get( ( req, res ) => {
    const { listId } = req.params;
    const list = lists.find( li => li.id == listId );
    if( !list ) {
      logger.error( `List with id ${ listId } not found` );
      return res
        .status( 404 )
        .send( `List Not Found` );
    }
    res.json( list );
  })
  .delete( ( req, res ) => {
    const { listId } = req.params;
    const listIndex = lists.findIndex( li => li.id == listId );
    if( listIndex === -1 ) {
      logger.error( `List with id ${ listId } not found` );
      return res
        .status( 404 )
        .send( `Not found` );
    };
    lists.splice( listIndex, 1 );
    logger.info( `List with ${ listId } deleted` );
    res
      .status( 204 )
      .end();
  });

  module.exports = listRouter;