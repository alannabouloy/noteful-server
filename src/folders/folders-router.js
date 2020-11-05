const express = require('express')
const FoldersService = require('./folders-service')
const path = require('path')
const xss = require('xss')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
})


foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { folder_name } = req.body;
        const newFolder = { folder_name }


        if(!folder_name){
            return res
                .status(400)
                .json({error: {message: `must have 'folder_name' in request body`}})
        }

        FoldersService.addFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getById(knexInstance, req.params.folder_id)
            .then(folder => {
                if(!folder){
                    return res
                        .status(404)
                        .json({error: { message: 'Folder Not Found' } })
                }
                res.folder = folder
                next()

            })
            .catch(next)
    })
    .get((req, res, next) => {
        console.log("this is the GET", res.folder)
        res.json(serializeFolder(res.folder))
    })

module.exports = foldersRouter