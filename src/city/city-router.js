const express = require( 'express' );
const path = require( 'path' );

const xss = require( 'xss' );
const cityRouter = express.Router();
const jsonParser = express.json();
const logger = require( '../logger' );
const CityService = require('./city-service');

cityRouter
  .route( '/cities' )
  .get( ( req, res, next ) => {
    const knexInstance = req.app.get( 'db' );
    CityService.getAllCities( knexInstance )
      .then( cities => {
        res.json( cities )
      })
      .catch( next );
  })
  .post( jsonParser, ( req, res, next ) => {
    const { list_id, name } = req.body;
    const newCity = { name, list_id };
    if( !name ) {
      logger.error( `Name is required` );
      return res
        .status( 400 )
        .send( `Invalid Name Data` );
    }
    if( !list_id ) {
      logger.error( `listId is required` );
      return res
        .status( 400 )
        .send( `Invalid listId Data` );
    }
    CityService.insertCity(
      req.app.get( 'db' ),
      newCity
    )
      .then( city => {
        res
          .status( 201 )
          .location( `${ path.posix.join( req.originalUrl )}/${ city.id }` )
          .json( city )
      })
      .catch( next )
  });

cityRouter
  .route( '/cities/:city_id' )
  .all( ( req, res, next ) => {
    CityService.getById(
      req.app.get( 'db' ),
      req.params.city_id )
        .then( city => {
          if( !city ) {
            return res.status( 404 ).json({
              error: { message: `City doesn't exist` }
            })
          }
          res.city = city
          next()
        })
        .catch( next )
  })
  .get( ( req, res, next ) => {
    res.json({
      id: res.city.id,
      name: xss( res.city.name ),
      list_id: res.city.list_id
    })
  })
  .delete( ( req, res, next ) => {
    CityService.deleteCity(
      req.app.get( 'db' ),
      req.params.city_id
    )
      .then( () => {
        res.status( 204 ).end()
      })
      .catch( next )
  })

module.exports = cityRouter;