// app.js
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs'); // Import the fs module
var https = require('https'); // Import the https module

var { initDatabase } = require('./db-middleware/pgInstance');
var userRoutes = require('./routes/users'); // Import user routes
var app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // Allows access from any origin
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Include DELETE and any other methods you need
  next();
});

// Routes
app.use('/api/v1/users', userRoutes); // Use user routes

// Read SSL certificate and key
const sslOptions = {
  key: fs.readFileSync('D:/album-files-prj/Album-FileManager/ssl/key.key'), 
  cert: fs.readFileSync('D:/album-files-prj/Album-FileManager/ssl/fullchain.pem'),
};

// Initialize database and start HTTPS server
initDatabase()
  .then(() => {
    https.createServer(sslOptions, app).listen(3001, '0.0.0.0', () => {
      console.log('HTTPS Server is running on port 3001');
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
  });

module.exports = app;
