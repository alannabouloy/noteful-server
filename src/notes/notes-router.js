const express = require('express')
const NotesService = require('./notes-service')
const path = require('path')
const xss = require('xss')

const notesRouter = express.Router()
const jsonParser = express.json()


const serializeNotes = notes => ({
    id: notes.id,
    note_name: xss(notes.note_name),
    modified: notes.modified,
    folder_id: notes.folder_id,
    content: xss(notes.content)
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNotes))
            })
            .catch(next)
    })

    module.exports = notesRouter