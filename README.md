# Noteful Server!

This is the server and database for the noteful project in the Thinkful Software Engineering Immersion Program.

The object of the Noteful App is an interface that allows users to add folders and notes, with each note being assigned to a specific folder. User should be able to access notes and folders through the React client application. 

## Documentation

This server has four endpoints:

1. `/api/folders` will allow two actions: GET and POST where the user can access all folders stored in the database and add new folders as needed. A GET call to this endpoint should return an array of json objects formatted with the below values:
    - id (unique primary key)
    - folder_name (unique string)

2. `/api/notes` will allow two actions: GET and POST where the user can access all notes stored in the database and add new notes as needed. A GET call to this endpoint should return an arrayof json objects formatted with the below values: 
    - id (unique primary key)
    - note_name (unique string)
    - modified (date object)
    - folder_id (reference to the id to corresponding folder)
    - content (string)

3. `/api/folders/:folder_id` will allow three actions: GET, DELETE, and PATCH. The user should be able to access a specific folder with the matching folder_id. A GET call to this endpoint will return a single json object formatted with the values listed above from the `/api/folders` endpoint. A PATCH call will only allow the user to change the name value of the folder, and not the id. DELETE will delete the folder and any notes stored within that folder. 

4. `/api/notes/:notes_id` will allow three actions: GET, DELETE, and PATCH. The user should be able to access a specific note with the matching note_id. A GET call to this endpoint will return a single json object formatted with the values listed above from the `/api/notes` endpoint. A PATCH call will allow the user to alter the name, folder, and content of the note, and it will also automatically update the date stored in the modified key. 

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

Make changes to the database `npm run migrate [migration-version]`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.