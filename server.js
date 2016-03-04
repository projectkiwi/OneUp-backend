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

app.use(bodyParser.urlencoded({
  extended: true
}));

var router = express.Router();

router.use(function(req, res, next) {
    console.log('----');
    console.log(req.method + ": " + req.originalUrl);
    console.log(req.body);
    if(req.headers.offset === undefined)
      req.headers.offset = 0;
    if(req.headers.limit === undefined)
      req.headers.limit = 20;
    console.log('----');
    next();
});

// Routes for /challenges 
var challengesRoute = router.route('/challenges');

// GET all challenges
challengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts',
    offset: parseInt(req.headers.offset), 
    limit: parseInt(req.headers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.send(err);

    res.json(challenges);
  });
});

// POST create a new challenge
challengesRoute.post(function(req, res) {
  var challenge = new Challenge();
  challenge.name = req.body.name;
  challenge.description = req.body.description;
  challenge.pattern = req.body.pattern;

  if (req.body.categories != undefined) {
    challenge.categories = req.body.categories.split(",");
  }
  
  challenge.save();

  challenge.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Challenge added!', data: challenge });
  });
});

// Route for /challenges/:challenge_id
var challengeDetailRoute = router.route('/challenges/:challenge_id');

// GET challenge details
challengeDetailRoute.get(function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, challenge) {
    if (err)
      res.send(err);

    res.json(challenge);
  });
});

// Route for /challenges/:challenge_id/attempts
var challengeAttemptRoute = router.route('/challenges/:challenge_id/attempts');

// POST submit a challenge attempt
challengeAttemptRoute.post(function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, challenge) {
    if (err)
      res.send(err);

    var attempt = new Attempt();
  
    attempt.preview_img = "https://placeholdit.imgix.net/~text?txtsize=33&txt=&w=350&h=150"; 
    attempt.gif_img = "https://media.giphy.com/media/xT9DPO1KTBOzoTVr8Y/giphy.gif";
    attempt.challenge =  req.params.challenge_id;
    attempt.save();

    challenge.attempts.push(attempt);
    challenge.save();
    res.json({ message: 'Attempt Created!', data: attempt});
  });
});

// Route for /challenges/local/new
var localNewChallengesRoute = router.route('/challenges/local/new');

localNewChallengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts',
    sort: { _id: 1},
    offset: parseInt(req.headers.offset), 
    limit: parseInt(req.headers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.send(err);

    res.json(challenges);
  });
});

var localPopularChallengesRoute = router.route('/challenges/local/popular');

localPopularChallengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts',
    sort: { vote_total: -1},
    offset: parseInt(req.headers.offset),
    limit: parseInt(req.hearers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.send(err);

    res.json(challenges);
  });
});

// Route for /users
var usersRoute = router.route('/users');

// GET all users
usersRoute.get(function(req, res) {
  User.find().exec(function(err, users) {
    if (err)
      res.send(err);

    res.json(users);
  });
});

// POST a user
usersRoute.post(function(req, res) {
  var user = new User();
  user.nickname = req.body.nickname;
  user.facebook_id = req.body.facebook_id;

  if (req.body.settings != undefined) {
    user.settings = req.body.settings.split(",");
  }
  
  user.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'User Created!', data: user})
  });
});

// Route for /users/:user_id
var userDetailRoute = router.route('/users/:user_id');

// GET user details
userDetailRoute.get(function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(err);

    res.json(user);
  });
});

// Route for /users/:user_id/bookmarks
var userBookmarkRoute = router.route('/users/:user_id/bookmarks');

// POST a user bookmark
userBookmarkRoute.post(function(req, res) {
  User.findById(req.params.user_id, function(err, user) {
    if (err)
      res.send(err);

    Challenge.findById(req.body.challenge_id, function(err, challenge) {
      if (err) 
        res.send(err);

      user.bookmarks.push(challenge);
      res.json({message: 'Bookmark Added!', data: challenge});
    });
  });
});

// Register all our routes
app.use('/', router);

// Start the server
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Running on port ' + port);