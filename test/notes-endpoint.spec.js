const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe(`/api/notes endpoints work`, () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))

    describe(`GET /api/notes endpoint working`, () => {

        context(`Given notes in the database`, () => {
            
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`returns 200 and an array of notes`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })
        })

        context(`Given no notes`, () => {
            it(`returns 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })
    })

    describe.only(`POST /api/notes endpoint works`, () => {
        const testFolders = makeFoldersArray()

        beforeEach(`insert folders`, () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
                .then(() => {
                    return supertest(app)
                        .get(`/api/folders`)
                        .then(res => {
                            console.log(res.body)
                        })
                })
        })

        it(`Returns 201 and new note`, () => {
            const newNote = {
                note_name: 'Test note',
                folder_id: 2,
                content: 'Test if it works'
            }

            supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body).to.have.property('id')
                    expect(res.body).to.have.property('modified')
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`api/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                })
        })
    })

    describe(`GET /api/notes/:note_id endpoint works`, () => {
        context(`Given notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray();

            beforeEach(`insert notes`, () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`returns 200 and specified note`, () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]

                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote)
            })
        })
        
        context(`Given no notes`, () => {
            it(`returns 404 and error message`, () => {
                const id = 12345
                const errorMessage = { error: { message: 'Note Not Found' } }

                return supertest(app)
                    .get(`/api/notes/${id}`)
                    .expect(404, errorMessage)
            })
        })
    })
})