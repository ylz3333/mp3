// Get the packages we need
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser');

// Read .env only if MONGODB_URI is not provided by environment (e.g., Render)
if (!process.env.MONGODB_URI) {
    require('dotenv').config();
}

// Create our Express application
var app = express();

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Connect to MongoDB (Atlas or local)
mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/mp3',
    { useNewUrlParser: true, useUnifiedTopology: true }
);

// Allow CORS so that backend and frontend could be put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Use routes as a module (see index.js)
require('./routes')(app, router);

// Start the server (bind to 0.0.0.0 for cloud envs)
app.get('/', function (req, res) { res.status(200).send('OK'); });
app.listen(port, '0.0.0.0');
console.log('Server running on port ' + port);
