const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')

describe(`/api/folders endpoints work`, () => {
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

    describe(`GET /api/folders endpoint works`, () => {

        context(`when there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert articles', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('returns 200 and an array of folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })

        })
        context(`when there are no folders`, () => {
            it('returns 200 and an empty array', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })
    })

    describe(`GET /api/folders/:folder_id`, () => {
        context(`there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert articles', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`responds with 200 and the specified folder`, () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })

        context(`the database is empty`, () => {
            it(`responds with a 404 message`, () => {
                const folderId = 12345
                const errorMessage = { error : { message: `Folder Not Found`} }

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, errorMessage)
            })

        })
    })
   
    describe(`POST /api/folders endpoint works`, () => {
        it(`returns a 201 and correct information when request valid`, () => {
            const newFolder = {
                folder_name: 'Test Folder added'
            }
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                    expect(res.body).to.have.property('id')
                    return res
                })
                .then(postRes => {
                    return supertest(app)
                        .get(`/api/folders/${postRes.body.id}`)
                        .expect(postRes.body)
                })

        })
        it(`returns a 400 bad request when given invalid data`, () => {

        })
    })
})