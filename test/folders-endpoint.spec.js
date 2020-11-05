const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const foldersRouter = require('../src/folders/folders-router')
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
   
    describe(`POST /api/folders`, () => {
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
            return supertest(app)
                .post('/api/folders')
                .send({})
                .expect(400, {
                    error: { message: `must have 'folder_name' in request body`}
                })
        })
    })

    describe(`DELETE /api/folders/:folder_id`, () => {
        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`returns a 204 and deletes folder`, () => {
                const folderToDelete = 2
                const expectedArray = testFolders.filter(folder => folder.id !== folderToDelete)

                return supertest(app)
                    .delete(`/api/folders/${folderToDelete}`)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get('/api/folders')
                            .expect(200, expectedArray)
                    })
            })
        })
        context(`Given there are no folders`, () => {
            it(`returns a 404 and error message`, () => {
                const folderToDelete = 12345
                return supertest(app)
                    .delete(`/api/folders/${folderToDelete}`)
                    .expect(404, {error: {message: 'Folder Not Found'}})
            })
        })
    })

    describe(`PATCH /api/folders/folder_id`, () => {
        context(`Given folders in database`, () => {
            const testFolders = makeFoldersArray()
            
            beforeEach(`insert folders`, () => {
                return db 
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`returns a 204 and updates the folder`, () => {
                const folderToUpdate = 2
                const updateFolder = {
                    folder_name: 'Updated Folder'
                }
                const expectedFolder = {
                    ...testFolders[folderToUpdate - 1],
                    ...updateFolder
                }
                
                return supertest(app)
                    .patch(`/api/folders/${folderToUpdate}`)
                    .send(updateFolder)
                    .expect(204)
                    .then(res => {
                        return supertest(app)
                            .get(`/api/folders/${folderToUpdate}`)
                            .expect(200, expectedFolder)
                    })
            })
            
            it(`returns a 400 if no valid field is given`, () => {
                const folderToUpdate = 2
                const updateFolder = {
                    invalidField: 'testing'
                }

                return supertest(app)
                    .patch(`/api/folders/${folderToUpdate}`)
                    .send(updateFolder)
                    .expect(400, {error: { message: `must provide a new 'folder_name' in request body`}})
            })
        })
        context(`Given no folders`, () => {
            it(`returns a 404 and error message`, () => {
                const folderToUpdate = 12345
                return supertest(app)
                    .patch(`/api/folders/${folderToUpdate}`)
                    .send({ })
                    .expect(404, { error: { message: `Folder Not Found`}})
            })
        })
    })
})
