const ListsService = require( '../src/list/list-service' );
const knex = require( 'knex' );
const { makeListsArray } = require( './lists.fixtures' );

describe( `Lists service object`, function() {
  let db

  let testLists = makeListsArray();

  before( () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  }) 

  // before( () => db( 'shootcast_lists' ).truncate() )

  // afterEach( () => db( 'shootcast_lists' ).truncate() )

  before( 'clean the table', () => db.raw( 'TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE' ))

  afterEach( 'cleanup',() => db.raw( 'TRUNCATE shootcast_cities, shootcast_lists RESTART IDENTITY CASCADE' ))

  after( () =>  db.destroy() )

  // CONTEXT HAS DATA

  context( `Given 'shootcast_lists has data`, () => {
    beforeEach( () => {
      return db
        .into( 'shootcast_lists' )
        .insert( testLists )
    })

    it( `getAllLists resolves all lists from 'shootcast_lists' table`, () => {
      return ListsService.getAllLists( db )
        .then( actual => {
          expect( actual ).to.eql( testLists )
        })
    })

    it( `getById() resolves a list by id from 'shootcast_lists' table`, () => {
      const thirdId = 3;
      const thirdTestList = testLists[ thirdId - 1 ];
      return ListsService.getById( db, thirdId )
        .then( actual => {
          expect( actual ).to.eql({
            id: thirdId,
            name: thirdTestList.name
          })
        })
    })

    it( `deleteList() removes a list by id from 'shootcast_lists' table`, () => {
      const listId = 3;
      return ListsService.deleteList( db, listId )
        .then( () => ListsService.getAllLists( db ))
        .then( allLists => {
          const expected = testLists.filter( list => list.id !== listId )
          expect( allLists ).to.eql( expected )
        })
    })

    it( `updateList() updates a list from 'shootcast_lists' table`, () => {
      const idOfListToUpdate = 3;
      const newListData = {
        name: 'updated list',
      }
      return ListsService.updateList( db, idOfListToUpdate, newListData )
        .then( () => ListsService.getById( db, idOfListToUpdate ))
        .then( list => {
          expect( list ).to.eql({
            id: idOfListToUpdate,
            ...newListData
          })
        })
    })

  })

  // CONTEXT HAS NO DATA

  context( `Given 'shootcast_lists' has no data`, () => {
    it( `getAllLists() resolves an empty array`, () => {
      return ListsService.getAllLists( db )
        .then( actual => {
          expect( actual ).to.eql([])
        })
    })

    it( `insertList() inserts a new list and resolves the new list with an 'id'`, () => {
      const newList = {
        name: 'New Test List'
      }
      return ListsService.insertList( db, newList )
        .then( actual => {
          expect( actual ).to.eql({
            id: 1,
            name: newList.name,
          })
        })
    })

  })

})