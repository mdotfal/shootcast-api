const CityService = {
  getAllCities( knex ) {
    return knex.select( '*' ).from( 'shootcast_cities' )
  },
  insertCity( knex, newCity ) {
    return knex
      .insert( newCity )
      .into( 'shootcast_cities' )
      .returning( '*' )
      .then( rows => {
        return rows[ 0 ]
      })
  },
  getById( knex, id ) {
    return knex.from( 'shootcast_cities' ).select( '*' ).where( 'id', id ).first() 
  },
  deleteCity( knex, id ) {
    return knex( 'shootcast_cities' )
      .where({ id })
      .delete()
  },
  updateCity( knex, id, newCityFields ) {
    return knex( 'shootcast_cities' )
      .where({ id })
      .update( newCityFields )
  }
}

module.exports = CityService;