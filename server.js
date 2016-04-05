// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
var mongoosePaginate = require('mongoose-paginate');

// MODELS
var ChallengeGroup = require('./models/challengegroup');
var Challenge = require('./models/challenge');
var Attempt = require('./models/attempt');
var User = require('./models/user');
var Vote = require('./models/vote');

// MONGO
mongoose.connect('mongodb://localhost:27017/oneup');

var app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// Register all our routes
app.use('/', require('./router'));

// Start the server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Running on port ' + port);

