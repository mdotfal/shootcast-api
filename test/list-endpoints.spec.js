const { expect } = require( 'chai' );
const knex = require( 'knex' );
const supertest = require('supertest');
const app = require( '../src/app' );
const { makeListsArray } = require( './lists.fixtures' );

describe( 'Lists Endpoints', function() {
  let db;

  before( 'make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set( 'db', db )
  });

  after( 'disconnect from db', () => db.destroy() );

  before( 'clean the table', () => db.raw( 'TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE' ))

  afterEach( 'cleanup',() => db.raw( 'TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE' ))

  describe( `GET /api/lists`, () => {
    // GIVEN NO LISTS
    context( 'Given there are no lists in the database', () => {
      it( `Given no lists`, () => {
        return supertest( app )
          .get( '/api/lists' )
          .expect( 200, [] )
      })
    })

    // GIVEN THERE ARE LISTS
    context( 'GIVEN there are lists in the database', () => {
      let testLists = makeListsArray();

      beforeEach( 'insert lists', () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
      })

      it( 'GET /api/lists responds with 200 and all lists', () => {
        return supertest( app )
          .get( '/api/lists' )
          .expect( 200, testLists )
      })
    })
  })

  describe( `GET /api/lists/:list_id`, () => {

    // GIVEN NO LISTS
    context( `Given no lists`, () => {
      it( `responds with 404`, () => {
        const listId = 123456
        return supertest( app )
          .get( `/api/lists/${ listId }`)
          .expect( 404, { error: { message: `List doesn't exist` }})
      })
    })

    // GIVEN THERE ARE LISTS
    context( 'Given there are lists in the database', () => {
      let testLists = makeListsArray();
  
      beforeEach( 'insert lists', () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
      })
  
      it( 'GET /api/lists/:list_id responds with 200 and the specified list', () => {
        const listId = 2;
        const expectedList = testLists[ listId - 1 ];
        return supertest( app )
          .get( `/api/lists/${ listId }` )
          .expect( 200, expectedList )
      })
    })

    context( `Given an XSS attack list`, () => {
      const maliciousList = {
        id: 911,
        name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
      }

      beforeEach( 'insert malicious list', () => {
        return db
          .into( 'shootcast_lists' )
          .insert([ maliciousList ])
      })

      it( 'removes XSS attack content', () => {
        return supertest( app )
          .get( `/api/lists/${ maliciousList.id }` )
          .expect( 200 )
          .expect( res => {
            expect( res.body.name ).to.eql( `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.` )
          })
      })
    })
  })

  describe( `POST /api/lists`, () => {
    it( `creates an lists, responding with 201 and the new list`, () => {
      const newList = {
        name: 'Test new list'
      }
      return supertest( app )
        .post( '/api/lists' )
        .send( newList )
        .expect( 201 )
        .expect( res => {
          expect( res.body.name ).to.eql( newList.name )
          expect( res.body ).to.have.property( 'id' )
          expect( res.headers.location ).to.eql( `/api/lists/${ res.body.id }` )
        })
        .then( postRes => {
          supertest( app )
            .get( `/api/lists/${ postRes.body.id }` )
            .expect( postRes.body )
        })
    })
  })

  describe( `DELETE /api/lists/:list_id`, () => {
    context( 'Given no lists', () => {
      it( `responds with 404`, () => {
        const listId = 123456
        return supertest( app )
          .delete( `/api/lists/${ listId }` )
          .expect( 404, {
            error: { message: `List doesn't exist` }
          })
      })
    })

    context( 'Given there are lists in the database', () => {
      const testLists = makeListsArray();

      beforeEach( 'insert lists', () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
      })

      it( 'responds with 204 and removes the article', () => {
        const idToRemove = 2;
        const expectedLists = testLists.filter( list => list.id !== idToRemove )
        return supertest( app )
          .delete( `/api/lists/${ idToRemove }` )
          .expect( 204 )
          .then( res => {
            supertest( app )
              .get( `/api/lists` )
              .expect( expectedLists )
          })
      })
    })
  })
})