const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware to parse JSON and URL encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Endpoint to create a file
const multer = require('multer');
const upload = multer();

// Endpoint to create a file
app.post('/createFile', upload.fields([]), (req, res) => {
    const filename = req.body.filename;
    const content = req.body.content;
    console.log('Received file data:', filename, content); // Log received data for debugging
    if (!filename || !content) {
        return res.status(400).send('Filename and content are required.');
    }

    fs.writeFile(path.join(__dirname, 'uploads', filename), content, (err) => {
        if (err) {
            console.error('Error creating file:', err);
            return res.status(500).send('Error creating file.');
        }
        console.log('File created successfully:', filename); // Log successful file creation
        res.status(200).send('File created successfully.');
    });
});


// Endpoint to get list of uploaded files
// Endpoint to get list of uploaded files
app.get('/getFiles', (req, res) => {
    fs.readdir(path.join(__dirname, 'uploads'), (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send('Error reading directory.');
        }
        const fileList = files.filter(file => /\.(log|txt|json|yaml|xml|js)$/.test(file));
        res.status(200).json(fileList);
    });
});


// Endpoint to get file content
app.get('/getFile/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname,'uploads', filename);
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filename);
        return res.status(400).send('File not found.');
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file.');
        }
        console.log('File content sent:', filename); // Log successful file content retrieval
        res.status(200).send(data);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
