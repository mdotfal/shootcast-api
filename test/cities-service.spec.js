const CityService = require( '../src/city/city-service' );
const knex = require( 'knex' );
const app = require( '../src/app' );
const { makeCitiesArray } = require( './cities.fixtures' );

describe.skip( `Cities service object`, function() {
  let db;
  
  before( () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set( 'db', db );
  }) 
  
  after( () =>  db.destroy() )
  
  before( () => db( 'shootcast_cities' ).truncate() )
  
  afterEach( () => db( 'shootcast_cities' ).truncate() )
  
  
  // CONTEXT HAS DATA
  
  context( `Given 'shootcast_cities has data`, () => {
    let testCities = makeCitiesArray();

    beforeEach( () => {
      return db
        .into( 'shootcast_cities' )
        .insert( testCities )
    })

    it( `getAllCities resolves all cities from 'shootcast_cities' table`, () => {
      return CityService.getAllCities( db )
        .then( actual => {
          expect( actual ).to.eql( testCities )
        })
    })

    it( `getById() resolves a city by id from 'shootcast_city' table`, () => {
      const thirdId = 3;
      const thirdTestCity = testCities[ thirdId - 1 ];
      return CityService.getById( db, thirdId )
        .then( actual => {
          expect( actual ).to.eql({
            id: thirdId,
            name: thirdTestCity.name
          })
        })
    })

    it( `deleteCity() removes a city by id from 'shootcast_cities' table`, () => {
      const cityId = 3;
      return CityService.deleteCity( db, cityId )
        .then( () => CityService.getAllCities( db ))
        .then( allCities => {
          const expected = testCities.filter( city => city.id !== cityId )
          expect( allCities ).to.eql( expected )
        })
    })

    it( `updateCity() updates a city from 'shootcast_city' table`, () => {
      const idOfCityToUpdate = 3;
      const newCityData = {
        name: 'updated city',
      }
      return CityService.updateCity( db, idOfCityToUpdate, newCityData )
        .then( () => CityService.getById( db, idOfCityToUpdate ))
        .then( city => {
          expect( city ).to.eql({
            id: idOfCityToUpdate,
            ...newCityData
          })
        })
    })

  })

  // CONTEXT HAS NO DATA

  context( `Given 'shootcast_cities' has no data`, () => {
    it( `getAllCities() resolves an empty array`, () => {
      return CityService.getAllCities( db )
        .then( actual => {
          expect( actual ).to.eql([])
        })
    })

    it( `insertCity() inserts a new city and resolves the new city with an 'id'`, () => {
      const newCity = {
        name: 'New Test City',
        list_id: 1
      }
      return CityService.insertCity( db, newCity )
        .then( actual => {
          expect( actual ).to.eql({
            id: 1,
            name: newCity.name,
            list_id: 1
          })
        })
    })

  })

})