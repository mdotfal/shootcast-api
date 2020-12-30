const { expect } = require( 'chai' );
const knex = require( 'knex' );
const supertest = require( 'supertest' );
const app = require( '../src/app' );
const { makeCitiesArray } = require( './cities.fixtures' );
const { makeListsArray } = require( './lists.fixtures' );

describe( 'Cities Endpoints' , function() {
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

  describe( `GET /cities`, () => {

    //GIVEN NO CITIES
    context( `Given there are no cities in the database`, () => {
      it( `Given no cities`, () => {
        return supertest( app )
          .get( '/lists' )
          .expect( 200, [] )
      })
    })

    //GIVEN THERE ARE CITIES
    context( `GIVEN there are cities in the database`, () => {
      let testCities = makeCitiesArray();
      let testLists = makeListsArray();

      beforeEach( () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
          .then( () => {
            return db
              .into( 'shootcast_cities' )
              .insert( testCities )
        })
      })
      
      it( 'GET /cities responds with 200 and all cities', () => {
        return supertest( app )
          .get( '/cities' )
          .expect( 200, testCities )
      })
    })
  })

  describe( `GET /cities/:city_id`, () => {

    //GIVEN NO CITIES
    context( `Given no cities`, () => {
      it( `responds with 404`, () => {
        const cityId = 123456;
        return supertest( app )
          .get( `/cities/${ cityId }` )
          .expect( 404, { error: { message: `City doesn't exist` }})
      })
    })

    // GIVEN THERE ARE CITIES
    context( `Given there are cities in the database`, () => {
      let testCities = makeCitiesArray();
      let testLists = makeListsArray();

      beforeEach( () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
          .then( () => {
            return db
              .into( 'shootcast_cities' )
              .insert( testCities )
        })
      })

      it( `GET /cities/:city_id responds with 200 and the specified city`, () => {
        const cityId = 2;
        const expectedCity = testCities[ cityId - 1 ];
        return supertest( app )
          .get( `/cities/${ cityId}` )
      })
    })

    context( `Given an XSS attack city`, () => {
      let testCities = makeCitiesArray();
      let testLists = makeListsArray();

      const maliciousCity = {
        id: 911,
        list_id: 1,
        name: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
      }

      beforeEach( () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
          .then( () => {
            return db
              .into( 'shootcast_cities' )
              .insert([ maliciousCity ])
        })
      })

      it( 'removes XSS attack content', () => {
        return supertest( app )
          .get( `/cities/${ maliciousCity.id }` )
          .expect( 200 )
          .expect( res => {
            expect( res.body.name ).to.eql( `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.` )
          })
      })
    })
  })

  describe( `POST /cities`, () => {

    let testLists = makeListsArray();

    beforeEach( () => {
      return db
        .into( 'shootcast_lists' )
        .insert( testLists )
    })

    it( `creates a city responding with 201 and the new city`, () => {
      const newCity = {
        name: 'Test new city',
        list_id: 1,
      }
      return supertest( app )
        .post( '/cities' )
        .send( newCity )
        .expect( 201 )
        .expect( res => {
          expect( res.body.name ).to.eql( newCity.name )
          expect( res.body.list_id ).to.eql( newCity.list_id )
          expect( res.headers.location ).to.eql( `/cities/${ res.body.id }` )
        })
        .then( postRes => {
          supertest( app )
            .get( `/cities/${ postRes.body.id }`)
            .expect( postRes.body )
        })
    })
  })

  describe( `DELETE /cities/:city_id`, () => {
    //GIVEN NO CITIES
    context( `Given no cities`, () => {
      it( `responds with 404`, () => {
        const cityId = 123456;
        return supertest( app )
          .delete( `/cities/${ cityId }` )
          .expect( 404, {
            error: {
              message: `City doesn't exist`
            }
          }) 
      })
    })

    //GIVEN THERE ARE CITIES
    context( `Given ther are cities in the database`, () => {
      let testCities = makeCitiesArray();
      let testLists = makeListsArray();

      beforeEach( () => {
        return db
          .into( 'shootcast_lists' )
          .insert( testLists )
          .then( () => {
            return db
              .into( 'shootcast_cities' )
              .insert( testCities )
        })
      })

      it( `responds with 204 and removes the city`, () => {
        const idToRemove = 2;
        const expectedCities = testCities.filter( city => city.id !== idToRemove )
        return supertest( app )
          .delete( `/cities/${ idToRemove }` )
          .expect( 204 )
          .then( res => {
            supertest( app )
              .get( '/cities' )
              .expect( expectedCities )
          })
      })
    })
  })
})