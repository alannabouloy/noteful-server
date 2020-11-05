const FoldersService = {
    getAllFolders(knex){
        return knex
            .select('*')
            .from('noteful_folders')

    },

    addFolder(knex, newFolder){
        return knex
                .into('noteful_folders')
                .insert(newFolder)
                .returning('*')
                .then(rows => {
                    return rows[0]
                })
    },

    updateFolder(knex, id, newFolderFields){
        return knex('noteful_folders')
            .where( {id} )
            .update(newFolderFields)

    },

    getById(knex, id){
        return knex
            .select('*')
            .from('noteful_folders')
            .where('id', id)
            .first()
    },

    deleteFolder(knex, id){
        return knex('noteful_folders')
            .where({id})
            .delete()
    }
}

module.exports = FoldersService;