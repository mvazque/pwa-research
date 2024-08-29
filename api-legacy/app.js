var express = require("express");
var cors = require('cors')
const fs = require('fs');
var bodyParser = require('body-parser')


var app = express();

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use(cors());

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

var todoDb = [
    {
        id: 'todo-1',
        description: 'Set up Manifest.json',
        completed: true
    },
    {
        id: 'todo-2',
        description: 'Set up Service Worker',
        completed: true
    },
    {
        id: 'todo-3',
        description: 'Set up Set Up IndexDB',
        completed: true
    },
    {
        id: 'todo-4',
        description: 'Test IndexDB',
        completed: true
    },
    {
        id: 'todo-5',
        description: 'Set Up Notifications',
        completed: false
    },
    {
        id: 'todo-6',
        description: 'Test Notifications',
        completed: false
    }
]

app.get("/todo", (req, res, next) => {
    res.json(todoDb);
});

app.post("/todo", jsonParser, (req, res, next) => {
    // Check if the request body has the expected structure
    if(!req.body.description) {
        return res.status(400).json({error: 'Invalid JSON structure. Expected {description: string}'});
    }

    //extract the description from the request body
    const {description, id} = req.body;

    // Create an object to save to the file
    const dataToSave = {description, id, completed: false};

    // convert the object to JSON
    const jsonData = JSON.stringify(dataToSave, null, 2) + ',';

    // write the JSON data to the file (data.json)
    fs.appendFile('data.json', jsonData, (err) => {
        if(err) {
            console.error(err);
            return res.status(500).json({error: 'Failed to save data to file'});
        }

        // Data successfully saved to file
        return res.status(200).json({message: 'Data saved to file successfully!'});
    })
});