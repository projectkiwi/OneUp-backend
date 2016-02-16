// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Test = require('./models/test');
var User = require('./models/user');
mongoose.connect('mongodb://localhost:27017/oneup');

// Create our Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

// Initial dummy route for testing
// http://localhost:3000/api
app.get('/', function(req, res) {
  res.json({ message: 'yay' }); 
});

// Create a new route with the prefix /tests
var testsRoute = app.route('/tests');

// Create endpoint /api/tests for POSTS
testsRoute.post(function(req, res) {
  // Create a new instance of the Test model

  var user = new User({name: 'Example Domain'})
  user.save()

  var test = new Test();

  // Set the test properties that came from the POST data
  test.name = req.body.name;
  test.type = req.body.type;
  test.quantity = req.body.quantity;
  test.test = user._id;

  // Save the test and check for errors
  test.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Test added!', data: test });
  });
});

// Create endpoint /api/tests for GET
testsRoute.get(function(req, res) {
  // Use the Test model to find all test
  Test.find().populate("test").exec(function(err, tests) {
    if (err)
      res.send(err);

    res.json(tests);
  });
});

// Create a new route with the /tests/:test_id prefix
var testRoute = router.route('/tests/:test_id');

// Create endpoint /api/tests/:test_id for GET
testRoute.get(function(req, res) {
  // Use the Test model to find a specific test
  Test.findById(req.params.test_id, function(err, test) {
    if (err)
      res.send(err);

    res.json(test);
  });
});

// Create endpoint /api/tests/:test_id for PUT
testRoute.put(function(req, res) {
  // Use the Test model to find a specific test
  Test.findById(req.params.test_id, function(err, test) {
    if (err)
      res.send(err);

    // Update the existing test quantity
    test.quantity = req.body.quantity;

    // Save the test and check for errors
    test.save(function(err) {
      if (err)
        res.send(err);

      res.json(test);
    });
  });
});

// Create endpoint /api/tests/:test_id for DELETE
testRoute.delete(function(req, res) {
  // Use the Test model to find a specific test and remove it
  Test.findByIdAndRemove(req.params.test_id, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Test removed from the locker!' });
  });
});

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('running on port ' + port);