const ListsService = {
  getAllLists( knex ) {
    return knex.select( '*' ).from( 'shootcast_lists' )
  },
  insertList( knex, newList ) {
    return knex
      .insert( newList )
      .into( 'shootcast_lists' )
      .returning( '*' )
      .then( rows => {
        return rows[ 0 ]
      })
  },
  getById( knex, id ) {
    return knex.from( 'shootcast_lists' ).select( '*' ).where( 'id', id ).first() 
  },
  deleteList( knex, id ) {
    return knex( 'shootcast_lists' )
      .where({ id })
      .delete()
  },
  updateList( knex, id, newListFields ) {
    return knex( 'shootcast_lists' )
      .where({ id })
      .update( newListFields )
  }
}

module.exports = ListsService;