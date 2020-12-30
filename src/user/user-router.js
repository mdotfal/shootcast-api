const express = require( 'express' );

const userRouter = express.Router();
const bodyParser = express.json();
const { v4: uuid } = require( 'uuid' );
const logger = require( '../logger' );


const { users } = require( '../store' );

userRouter
  .route( '/user' )
  .get( ( req, res ) => {
    res.json( users );
  })
  .post( bodyParser, ( req, res ) => {
    const { username, password } = req.body;
    if( !username ) {
      logger.error( `Username is required` );
      return res
        .status( 400 )
        .send( `Invalid username` );
    }
    const id = uuid();
    const user = {
      id,
      username,
      password
    }
    users.push( user );
    logger.info( `User with id ${ id } created` );
    res
      .status( 201 )
      .location( `http://localhost:8000/user/${ id }`)
      .json( user );
  });

userRouter
  .route( '/user/:userId' )
  .get( ( req, res ) => {
    const { userId } = req.params;
    const user = users.find( u => u.id == userId );
    if( !user ) {
      logger.error( `User with id ${ userId } not found` );
      return res
        .status( 404 )
        .send( `User Not Found` );
    }
    res.json( user );
  })
  .delete( ( req, res ) => {
    const { userId } = req.params;
    const userIndex = users.findIndex( u => u.id == userId );
    if( userIndex === - 1 ) {
      logger.error( `User with id ${ userId } not found` );
      return res
        .status( 400 )
        .send( `Not Found` );
    }
    users.splice( userIndex, 1 );
    logger.info( `User with ${ userId } deleted` );
    res
      .status( 204 )
      .end();
  });

module.exports = userRouter;