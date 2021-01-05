const express = require( 'express' );
const path = require( 'path' );

const xss = require( 'xss' );
const listRouter = express.Router();
const jsonParser = express.json();
const logger = require( '../logger' );
const ListsService = require( './list-service' );

listRouter
  .route( '/lists' )
  .get( ( req, res, next ) => {
    const knexInstance = req.app.get( 'db' );
    ListsService.getAllLists( knexInstance )
      .then( lists => {
        res.json( lists )
      })
      .catch( next );
  })
  .post( jsonParser, ( req, res, next ) => {
    const { name } = req.body;
    const newList = { name }

    ListsService.insertList(
      req.app.get( 'db' ),
      newList
    )
      .then( list => {
        res
          .status( 201 )
          .location( `${ path.posix.join( req.originalUrl )}/${ list.id }`)
          .json( list )
      })
      .catch( next )
  })

listRouter
  .route( '/lists/:list_id' )
  .all( ( req, res, next ) => {
    ListsService.getById( 
      req.app.get( 'db' ), 
      req.params.list_id )
      .then( list => {
        if ( !list ) {
          return res.status( 404 ).json({
            error: { message: `List doesn't exist` }
          })
        }
        res.list = list
        next()
      })
      .catch( next )
  })
  .get( ( req, res, next ) => {
    res.json({
      id: res.list.id,
      name: xss( res.list.name )
    })
  })
  .delete( ( req, res, next ) => {
    ListsService.deleteList(
      req.app.get( 'db' ),
      req.params.list_id
    )
      .then( () => {
        res.status( 204 ).end()
      })
      .catch( next )
  })

module.exports = listRouter;