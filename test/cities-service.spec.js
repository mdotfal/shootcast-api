const CityService = require( '../src/city/city-service' );
const knex = require( 'knex' );
const app = require( '../src/app' );
const { makeCitiesArray } = require( './cities.fixtures' );
const { makeListsArray } = require( './lists.fixtures' );

describe( `Cities service object`, function() {
  let db;
  
  before( () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set( 'db', db );
  }) 

  after( () =>  db.destroy() )
  
  before('clean the table', () => db.raw('TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE'))
  
  // CONTEXT HAS DATA
  
  context( `Given 'shootcast_cities has data`, () => {
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

    it( `getAllCities resolves all cities from 'shootcast_cities' table`, () => {
      return CityService.getAllCities( db )
        .then( actual => {
          expect( actual ).to.eql( testCities )
        })
    })

    it( `getById() resolves a city by id from 'shootcast_cities' table`, () => {
      const thirdId = 3;
      const thirdTestCity = testCities[ thirdId - 1 ];
      return CityService.getById( db, thirdId )
        .then( actual => {
          expect( actual ).to.eql({
            id: thirdId,
            list_id: thirdTestCity.list_id,
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
        list_id: 3,
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

      it.skip( `insertCity() inserts a new city and resolves the new city with an 'id'`, () => {

        const newCity = {
          name: 'New Test City',
          list_id: 1
        }
        return CityService.insertCity( db, newCity )
          .then( actual => {
            expect( actual ).to.eql({
              id: newCity.id,
              name: newCity.name,
              list_id: newCity.list_id
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


  })

})