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
   .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { note_name, folder_id, content } = req.body
        const newNote = { note_name, folder_id, content}

        NotesService.addNewNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNotes(note))
            })
            .catch(next)

    })

notesRouter
    .route('/:notes_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.notes_id

        NotesService.getById(knexInstance, id)
            .then(note => {
                if(!note){
                    return res
                        .status(404)
                        .json({error: {message: `Note Not Found`}})
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNotes(res.note))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.deleteNote(knexInstance, res.note.id)
            .then(() => {
                res
                    .status(204)
                    .end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { note_name, content } = req.body
        const noteToUpdate = {note_name, content}
        
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `must provide a new 'note_name' or 'content' in request body`
                }
            })
        }

        if(note_name){
            if(note_name.length < 3){
                return res
                    .status(400)
                    .json({error: {message: 'note_name must be 3 or more characters'}})
            }
        }
        if(content){
            if(content > 1000){
                return res
                .status(400)
                .json({error: {message: 'content cannot exceed 1000 characters'}})
            }
        }
        NotesService.updateNote(knexInstance, res.note.id, noteToUpdate)
            .then(() => {
                res
                    .status(204)
                    .end()
            })
            .catch(next)
    })

    module.exports = notesRouter