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

    describe(`GET api/folders endpoint works`, () => {

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
})