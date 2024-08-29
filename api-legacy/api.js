const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const webPush = require('web-push');

require('dotenv').config();

process.env.PUBLIC_KEY;
process.env.PRIVATE_KEY;

const cors = require('cors');

const app = express();
const port = 3000; // You can change the port as needed

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

app.use(cors({
    origin: '*'
}));
// POST endpoint to save an object to a JSON file
app.post('/:filename', (req, res) => {
  const { filename } = req.params;
  const data = req.body;

  if (!filename || !data) {
    return res.status(400).json({ error: 'Both filename and data are required.' });
  }

  // Construct the filename with .json extension
  const jsonFilename = `${filename}.json`;

  // Read the existing JSON file (if it exists)
  let existingData = [];
  try {
    const fileContent = fs.readFileSync(jsonFilename, 'utf8');
    existingData = JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist or is not valid JSON, continue with an empty array
  }

  if(filename === 'todos'){
    data.completed = false;
  }

  // Append the new data to the existing data
  existingData.push(data);

  // Write the updated data back to the JSON file
  fs.writeFileSync(jsonFilename, JSON.stringify(existingData, null, 2));

  if(filename !== 'subscriptions'){
    webPush.setVapidDetails('mailto:person@place.com', process.env.PUBLIC_KEY, process.env.PRIVATE_KEY)
    const {status, body } = getData('subscriptions');

    body.forEach(sub => {
      
      if(!sub.endpoint){
        return;
      }
      let pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.keys.auth,
          p256dh: sub.keys.p256dh
        }
      };

      webPush.sendNotification(pushConfig, JSON.stringify({
        // title: 'New Todo',
        // content: 'New Todo added!',
        // openUrl: '/',
        notification: {
          title: 'Created a new Todo',
          body: 'New Todo was added to the system!',
          image: '/assets/icons/icon-144x144.png',
          badge: '/assets/icons/icon-144x144.png',
          icon: '/assets/icons/icon-144x144.png',
          vibrate: [100, 50, 200],
          actions: [
            { action: 'confirm', title: 'Okay', icon: '/assets/icons/icon-144x144.png' },
            { action: 'cancel', title: 'Cancel', icon: '/assets/icons/icon-144x144.png'}
          ],
          data: {
            url: '/'
          }
        }
      }))
        .catch(function(err) {
          console.log(err);
        })
    });
  }

  res.status(201).json({ message: 'Data Stored', id: data.id });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});








function getData(filename) {
  // Construct the filename with .json extension
  const jsonFilename = `${filename}.json`;

  // Check if the JSON file exists
  if (!fs.existsSync(jsonFilename)) {
    // return res.status(404).json({ error: 'File not found.' });
    return { status: 404, body: {error: 'File not found.'} };
  }

  // Read the JSON file and send the data as the response
  try {
    const fileContent = fs.readFileSync(jsonFilename, 'utf8');
    const data = JSON.parse(fileContent);
    return {status: 200, body: data};
  } catch (error) {
    // res.status(500).json({ error: 'Failed to read JSON file.' });
    return { status: 500, body: {error: 'Failed to read JSON file.'} };
  }
} 

// GET endpoint to retrieve data from a JSON file
app.get('/:filename', (req, res) => {
    const { filename } = req.params;
  
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required.' });
    }

    const {status, body} = getData(filename);
    res.status(status).json(body);
});
  
// GET endpoint to retrieve a single item from a JSON file
app.get('/getItem/:filename/:itemId', (req, res) => {
    const { filename, itemId } = req.params;
  
    if (!filename || !itemId) {
      return res.status(400).json({ error: 'Both filename and itemId are required.' });
    }
  
    // Construct the filename with .json extension
    const jsonFilename = `${filename}.json`;
  
    // Check if the JSON file exists
    if (!fs.existsSync(jsonFilename)) {
      return res.status(404).json({ error: 'File not found.' });
    }
  
    // Read the JSON file and parse its content
    try {
      const fileContent = fs.readFileSync(jsonFilename, 'utf8');
      const data = JSON.parse(fileContent);
  
      // Find the item with the specified ID
      const item = data.find(item => item.id === itemId);
  
      if (!item) {
        return res.status(404).json({ error: 'Item not found.' });
      }
  
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read JSON file.' });
    }
  });
  