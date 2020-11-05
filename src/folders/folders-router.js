const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()



foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders)
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
        res.json({
            id: res.folder.id,
            folder_name: res.folder.folder_name
        })
        .catch(next)
    })

module.exports = foldersRouter