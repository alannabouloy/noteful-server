const NotesService = {
    getAllNotes(knex){
        return knex
                .select('*')
                .from('noteful_notes')
    },

    addNewNote(knex, newNote){
        return knex
            .into('noteful_notes')
            .insert(newNote)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id){
        return knex
            .select('*')
            .from('noteful_notes')
            .where('id', id)
            .first()
    },

    updateNote(knex, id, newNoteFields){
        return knex('noteful_notes')
            .where({id})
            .update(newNoteFields)
    },

    deleteNote(knex, id){
        return knex('noteful_notes')
            .where({id})
            .delete()
    }
}

module.exports = NotesService;