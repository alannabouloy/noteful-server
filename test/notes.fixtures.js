const { default: xss } = require("xss");

function makeNotesArray() {
    return [
        {
            id: 1,
            note_name: 'Test Note 1',
            modified: '2029-01-22T16:28:32.615Z',
            folder_id: 2,
            content: 'This is a test note'
        },
        {
            id: 2,
            note_name: 'Test Note 2',
            modified: '2029-01-22T16:28:32.615Z',
            folder_id: 3,
            content: 'This is a test note'
        },
        {
            id: 3,
            note_name: 'Test Note 3',
            modified: '2029-01-22T16:28:32.615Z',
            folder_id: 2,
            content: 'This is a testnote'
        }
    ]
}

module.exports = { makeNotesArray };