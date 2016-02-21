// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
//MODELS
var ChallengeGroup = require('./models/challengegroup');
var Challenge = require('./models/challenge');
var Attempt = require('./models/attempt');
var User = require('./models/user');
//MONGO
mongoose.connect('mongodb://localhost:27017/oneup');

var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));

var router = express.Router();

router.use(function(req, res, next) {
    console.log('----');
    console.log(req.method+ ": " +req.originalUrl);
    console.log(req.body);
    console.log('----');
    next();
});

router.get('/', function(req, res) {
  res.json({ message: 'OK' }); 
});

/**
* Routes for /challenges
*/ 

var challengesRoute = router.route('/challenges');
//GET get all challenges
challengesRoute.get(function(req, res) {
  Challenge.find().populate("attempts").exec(function(err, tests) {
    if (err)
      res.send(err);

    res.json(tests);
  });
});

//POST create a new challenge
challengesRoute.post(function(req, res) {

  var challenge = new Challenge();
  challenge.name = req.body.name;
  challenge.description = req.body.description;
  challenge.pattern = req.body.pattern;
  challenge.categories = req.body.categories.split(",");
  challenge.save();

  challenge.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Challenge added!', data: challenge });
  });

});

var challengeDetailRoute = router.route('/challenges/:challenge_id');

//GET challenge details
challengeDetailRoute.get(function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, data) {
    if (err)
      res.send(err);

    res.json(data);
  });
});

var challengeAttemptsRoute = router.route('/challenges/:challenge_id/attempts');
//POST submit a challenge attemtp
challengeAttemptsRoute.post(function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, challenge) {
    if (err)
      res.send(err);

    var attempt = new Attempt();
    attempt.challenge =  req.params.challenge_id;
    attempt.save();

    challenge.attempts.push(attempt);
    challenge.save();
    res.json(challenge);
  });
});


// Register all our routes with /api
app.use('/api', router);

// Start the server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('running on port ' + port);