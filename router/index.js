var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
var mongoosePaginate = require('mongoose-paginate');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var FB = require('fb');
var jwt = require('jsonwebtoken');
var keys = require('../keys');
var gify = require('gify');
var multer = require('multer');
var async = require('async'); 
var Promise = require('promise');

// MODELS
var ChallengeGroup = require('../models/challengegroup');
var Challenge = require('../models/challenge');
var Attempt = require('../models/attempt');
var User = require('../models/user');
var Vote = require('../models/vote');
var Location = require('../models/location');
var Notification = require('../models/notification');

var router = express.Router();

router.use(function(req, res, next) {
  console.log('----');
  console.log("request: " + req.method + ": " + req.originalUrl);
  console.log(req.body);
  console.log("post params:");
  console.log(req.params);
  console.log("get params:")
  console.log(req.query);

  if (req.headers.offset === undefined)
    req.headers.offset = 0;
  
  if (req.headers.limit === undefined)
    req.headers.limit = 20;

  var header_token = req.headers.token;
  var body_token = req.body.token;
  var param_token = req.query.token;
  req.userid = null;

  if (header_token) {
    var decoded = jwt.verify(header_token, 'secret');
    
    User.findById(decoded.uid, function(err, user) {
      if (err || user == null)
        res.json("Token decoded but user doesn't exist.");
      else {
        req.userid = decoded.uid;
        console.log("(header) Authenticated user! (" + req.userid + ")");
        console.log('----');
        next();
      }
    });     
  }
  else if (body_token) {
    var decoded = jwt.verify(body_token, 'secret'); 
    User.findById(decoded.uid, function(err, user) {
      if (err || user == null)
        res.json("Token decoded but user doesn't exist.");
      else {
        req.userid = decoded.uid;
        console.log("(header) Authenticated user! (" + req.userid + ")");
        console.log('----');
        next();
      }
    });
  }
  else if (param_token)
  {
    var decoded = jwt.verify(param_token, 'secret'); 
    
    User.findById(decoded.uid, function(err, user) {
      if (err || user == null)
        res.json("Token decoded but user doesn't exist.");
      else {
        req.userid = decoded.uid;
        console.log("(header) Authenticated user! (" + req.userid + ")");
        console.log('----');
        next();
      }
    });
  }
  else {
    console.log('----');

    if (req.userid == null && req.originalUrl != '/auth/facebook') {
      res.json({ message: 'Invalid User!' });
    }
    else {
      next();
    } 
  }
});

router.route('/').get(function(req, res) {
  var Table = require('cli-table');

  var table = new Table({
    head: ['Methods', 'Endpoint']
  });

  router.stack.forEach(function(r) {
    var methods = [];
  
    if (r.route && r.route.path) {
      r.route.stack.forEach(function(s) {
        methods.push(s.method);
      });

      table.push([methods, r.route.path, JSON.stringify(r.keys)]);
    }
  });

  console.log(table.toString());
  res.json(router.stack);
});

// Routes for /challenges 
var challengesRoute = router.route('/challenges');

// GET global challenges
challengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts location user',
    sort: { 
      challenge_likes: -1,
      updated_on: -1
    },
    offset: parseInt(req.headers.offset), 
    limit: parseInt(req.headers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.json({ success: false });

    User.findById(req.userid, function(err, user) {
      if (err)
        res.json({ success: false });

      async.each(challenges.docs, function(c, challengeCallback) {
        c.liked_top_attempt = false;
        c.liked_previous_attempt = false;
        
        if (user.bookmarks.indexOf(c._id) != -1) {
          c.bookmarked_challenge = true;
        }
        else {
          c.bookmarked_challenge = false;
        }

        if (c.user_likes.indexOf(req.userid) != -1) {
          async.each(c.attempts, function(a, attemptCallback) {
            if (a.user_likes.indexOf(req.userid) != -1) {
              a.liked_attempt = true;

              if (c.attempts.indexOf(a) == c.attempts.length - 1) {
                c.liked_top_attempt = true;
              }
              else {
                c.liked_previous_attempt = true;
              }
            }
            else {
              a.liked_attempt = false;
            }

            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
        else {
          async.each(c.attempts, function(a, attemptCallback) {
            a.liked_attempt = false;
            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
      }, function(err) {
          if (err) {
            res.json({ success: false });
          }
          else {
            challenges.success = true;
            res.json(challenges);
          }
        }
      );
    });
  });
});

// Route for /challenges/local/new
var localNewChallengesRoute = router.route('/challenges/local/new');

// GET local new challenges
localNewChallengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts location user',
    sort: {
      updated_on: -1,
      challenge_likes: -1
    },
    offset: parseInt(req.headers.offset), 
    limit: parseInt(req.headers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.json({ success: false });

    User.findById(req.userid, function(err, user) {
      if (err)
        res.json({ success: false });

      async.each(challenges.docs, function(c, challengeCallback) {
        c.liked_top_attempt = false;
        c.liked_previous_attempt = false;
        
        if (user.bookmarks.indexOf(c._id) != -1) {
          c.bookmarked_challenge = true;
        }
        else {
          c.bookmarked_challenge = false;
        }

        if (c.user_likes.indexOf(req.userid) != -1) {
          async.each(c.attempts, function(a, attemptCallback) {
            if (a.user_likes.indexOf(req.userid) != -1) {
              a.liked_attempt = true;

              if (c.attempts.indexOf(a) == c.attempts.length - 1) {
                c.liked_top_attempt = true;
              }
              else {
                c.liked_previous_attempt = true;
              }
            }
            else {
              a.liked_attempt = false;
            }

            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
        else {
          async.each(c.attempts, function(a, attemptCallback) {
            a.liked_attempt = false;
            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
      }, function(err) {
          if (err) {
            res.json({ success: false });
          }
          else {
            challenges.success = true;
            res.json(challenges);
          }
        }
      );
    });
  });
});

// Route for /challenges/local/popular
var localPopularChallengesRoute = router.route('/challenges/local/popular');

// GET local popular challenges
localPopularChallengesRoute.get(function(req, res) {
  var options = {
    populate: 'attempts location user',
    sort: { 
      challenge_likes: -1,
      updated_on: -1
    },
    offset: parseInt(req.headers.offset),
    limit: parseInt(req.headers.limit)
  };

  Challenge.paginate({}, options, function(err, challenges) {
    if (err)
      res.send(err);

    User.findById(req.userid, function(err, user) {
      if (err)
        res.json({ success: false });

      async.each(challenges.docs, function(c, challengeCallback) {
        c.liked_top_attempt = false;
        c.liked_previous_attempt = false;
        
        if (user.bookmarks.indexOf(c._id) != -1) {
          c.bookmarked_challenge = true;
        }
        else {
          c.bookmarked_challenge = false;
        }

        if (c.user_likes.indexOf(req.userid) != -1) {
          async.each(c.attempts, function(a, attemptCallback) {
            if (a.user_likes.indexOf(req.userid) != -1) {
              a.liked_attempt = true;

              if (c.attempts.indexOf(a) == c.attempts.length - 1) {
                c.liked_top_attempt = true;
              }
              else {
                c.liked_previous_attempt = true;
              }
            }
            else {
              a.liked_attempt = false;
            }

            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
        else {
          async.each(c.attempts, function(a, attemptCallback) {
            a.liked_attempt = false;
            a.deepPopulate('user', function(err, a_pop) {
              if (err)
                res.json({ success: false });

              a.save(function(err) {
                if (err) {
                  attemptCallback('Save Failed');
                }
                else {
                  attemptCallback();
                }
              });
            });
          }, function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              c.save(function(err) {
                if (err) {
                  challengeCallback('Save Failed');
                }
                else {
                  challengeCallback();
                }
              });
            }
          });
        }
      }, function(err) {
          if (err) {
            res.json({ success: false });
          }
          else {
            challenges.success = true;
            res.json(challenges);
          }
        }
      );
    });
  });
});

// POST create a new challenge
challengesRoute.post(function(req, res) {
  User.findById(req.userid, function(err, user) {
    if (err)
      res.json({ success: false });

    var challenge = new Challenge();

    // Required
    challenge.user = req.userid;
    challenge.name = req.body.name;
    challenge.description = req.body.description;
    challenge.categories = req.body.categories;
    challenge.location = req.body.location_id;
    challenge.created_on = Date.now();
    challenge.updated_on = Date.now();
    challenge.type = req.body.type;
    challenge.quantifier = req.body.type;
    challenge.quantity = req.body.type;
  
    challenge.save(function(err) {
      if (err)
        res.json({ success: false });

      if (user.associated_challenges.indexOf(challenge._id) == -1) {
        user.associated_challenges.push(challenge._id);

        user.save(function(err) {
          if (err)
            res.json({ success: false });

          res.json({ success: true, data: challenge });
        });
      }
      else {
        res.json({ success: true, data: challenge });
      }
    });
  });
});

// Route for /challenges/:challenge_id
var challengeDetailRoute = router.route('/challenges/:challenge_id');

// GET challenge details
challengeDetailRoute.get(function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, c) {
    if (err)
      res.json({ success: false });

    User.findById(req.userid, function(err, user) {
      if (err)
        res.json({ success: false });

      var likedPrev = false;
      c.liked_top_attempt = false;
      c.liked_previous_attempt = false;
      c.bookmarked_challenge = false;

      if (c.user_likes.indexOf(req.userid) != -1) {
        async.each(c.attempts, function(a, attemptCallback) {
          if (a.user_likes.indexOf(req.userid) != -1) {
            a.liked_attempt = true;

            if (c.attempts.indexOf(a) == c.attempts.length - 1) {
              c.liked_top_attempt = true;
            }
            else {
              c.liked_previous_attempt = true;
            }
          }
          else {
            a.liked_attempt = false;
          }

          a.deepPopulate('user', function(err, a_pop) {
            if (err)
              res.json({ success: false });

            a.save(function(err) {
              if (err) {
                attemptCallback('Save Failed');
              }
              else {
                attemptCallback();
              }
            });
          });
        },
        function(err) {
          if (err)
            res.json({ success: false });

          if (user.bookmarks.indexOf(c._id) != -1) {
            c.bookmarked_challenge = true;
          }

          c.save(function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              res.json(c);
            }
          });
        });
      }
      else {
        async.each(c.attempts, function(a, attemptCallback) {
          a.liked_attempt = false;
          a.deepPopulate('user', function(err, a_pop) {
            if (err)
              res.json({ success: false });

            a.save(function(err) {
              if (err) {
                attemptCallback('Save Failed');
              }
              else {
                attemptCallback();
              }
            });
          });
        },
        function(err) {
          if (err)
            res.json({ success: false });

          if (user.bookmarks.indexOf(c._id) != -1) {
            c.bookmarked_challenge = true;
          }

          c.save(function(err) {
            if (err) {
              res.json({ success: false });
            }
            else {
              res.json(c);
            }
          });
        });
      }
    });
  }).populate('attempts location user');
});

// Route for /challenges/:challenge_id/attempts
var challengeAttemptRoute = router.route('/challenges/:challenge_id/attempts');

// POST submit a challenge attempt
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/challenge_attempts');
  },
  filename: function (req, file, cb) {
    console.log(file);
    var extension = file.originalname.split('.').pop();
    cb(null, req.params.challenge_id + '_' + req.userid + '_' + Date.now() + '_orig.'+extension);
  }
})

var upload = multer({ storage: storage });

challengeAttemptRoute.post(upload.single('video'), function(req, res) {
  Challenge.findById(req.params.challenge_id, function(err, challenge) {
    console.log("processing upload");
    console.log(req.file);
    if (err)
      res.send(err);

    User.findById(req.userid, function(err, user) {
      var attempt = new Attempt();

      var opts = {
        width: 300
      };

      var f = req.file.path.substr(0, req.file.path.lastIndexOf('_orig'));
      var gifpath = f + ".gif";
      console.log("TEST: " + f);
    
      gify(req.file.path, gifpath, opts, function(err) {
        if (err) 
          throw err;
      });
      
      attempt.orig_video = req.file.path;
      attempt.gif_img = gifpath;
      attempt.user = user;
      attempt.description = req.body.description;
      attempt.type = challenge.type;
      attempt.quantifier = challenge.quantifier;
      attempt.quantity = req.body.quantity;
      attempt.challenge =  req.params.challenge_id;
      attempt.save(function(err) {
        if (err)
          res.send(err);

        challenge.updated_on = Date.now();
        challenge.attempts.push(attempt);
        challenge.save(function(err) {
          if (err)
            res.send(err);

          if (user.associated_challenges.indexOf(challenge._id) == -1) {
            user.associated_challenges.push(challenge._id);
          }
          if (user.records.indexOf(challenge._id) == -1) {
            user.records.push(challenge);
          }

          user.save(function(err) {
            if (err)
              res.send(err);

            res.json({ message: 'Attempt Created!', data: attempt });
          });   
        });
      });
    });
  });
});

// Route for /challenges/like/:attempt_id
var attemptLikeRoute = router.route('/challenges/like/:attempt_id');

// POST like an attempt
attemptLikeRoute.post(function(req, res) {
  Attempt.findById(req.params.attempt_id, function(err, attempt) {
    if (err)
      res.send(err);

    User.findById(req.userid, function(err, user) {
      if (err)
        res.send(err);

      Challenge.findById(attempt.challenge, function(err, challenge) {
        if (err)
          res.send(err);

        var like;

        if (attempt.user_likes.indexOf(user._id) != -1) {
          like = false;

          attempt.user_likes.splice(attempt.user_likes.indexOf(req.userid, 1));
          attempt.like_total -= 1;

          user.liked_challenges.splice(user.liked_challenges.indexOf(challenge._id), 1);

          challenge.challenge_likes -= 1;
          challenge.user_likes.splice(challenge.user_likes.indexOf(req.userid), 1);
        }
        else {
          like = true;

          attempt.user_likes.push(req.userid);
          attempt.like_total += 1;

          user.liked_challenges.push(challenge);
          
          challenge.challenge_likes += 1;
          challenge.user_likes.push(req.userid);
        }

        attempt.save(function(err) {
          if (err)
            res.json({ success: false });
          else {
            user.save(function(err) {
              if (err)
                res.json({ success: false });
              else {
                challenge.save(function(err) {
                  if (err)
                    res.json({ success: false });

                  res.json({ success: true, like: like });
                });
              }
            });
          }
        });
      });
    });
  });
});

// Route for /users
var usersRoute = router.route('/users');

// GET all users
usersRoute.get(function(req, res) {
  User.find().exec(function(err, users) {
    if (err)
      res.json({ success: false });

    res.json(users);
  });
});

// Route for /users/bookmark/:challenge_id
var userBookmarkRoute = router.route('/users/bookmark/:challenge_id');

// POST a user bookmark
userBookmarkRoute.post(function(req, res) {
  User.findById(req.userid, function(err, user) {
    if (err)
      res.send(err);

    var index = user.bookmarks.indexOf(req.params.challenge_id);

    if (index == -1) {
      user.bookmarks.push(req.params.challenge_id);
      user.save(function(err) {
        if (err)
          res.json({ success: false });

        res.json({ success: true, bookmark: true });
      });
    }
    else {
      user.bookmarks.splice(index, 1);
      user.save(function(err) {
        if (err)
          res.json({ success: false });
          
        res.json({ success: true, bookmark: false });
      });
    }
  });
});

router.route('/me').get(function(req,res) {
  User.findById(req.userid, function(err, user) {
    res.json(user);
  });
});

router.route('/me').put(function(req,res) {
  User.findById(req.userid, function(err, user) {
    if (err)
      res.json({ success: false });

    if (req.body.username != undefined) {
      //todo: check for uniqueness on username
      user.username = req.body.username;
      user.save(function(err, user) {
        res.json(user);
      });
    }
    else {
      res.json(user);
    }
  });
});

var userBookmarksRoute = router.route('/me/bookmarks');

userBookmarksRoute.get(function(req, res) {
  User.findById(req.userid, function(err, user) {
    if (err)
      res.json({ success: false });

    res.json(user.bookmarks);
  });
});


var userNotificationsRoute = router.route('/me/notifications');

userNotificationsRoute.get(function(req, res) {
  User.findById(req.userid, function(err, user) {
    Challenge.findOne({}, function(err, challenge) {
      var notifs = [];
      
      n1 = new Notification();
      n1.text = "liked your challenge";
      n1.from = user;
      n1.recipient = user;
      n1.challenge = challenge;
      notifs.push(n1);
      notifs.push(n1);

      res.json(notifs);
    });
  });
});

router.route('/auth/facebook').post(function(req,res) {
  var access_token = req.body.access_token;
  var email = req.body.email;
  var new_account;

  console.log(req.body.access_token);
  console.log(req.body.email);
  console.log(req.body);
  
  User.findOne({ 'email': email }, function (err, user) {
    if (err || user === null) {
      console.log("Create new account");
      
      // Create a new account
      user = new User();
      user.email = email;
                    
      user.save(function(err) {
        if (err)
          console.log(err);
      });
                    
      new_account = true;
    }
    else {
      new_account = false;
    }
        
    FB.setAccessToken(access_token);
    
    FB.api('me', { fields: ['id', 'name', 'email'] }, function (fb_res) {
      user.facebook_id = fb_res.id;

      if (fb_res.email != email) {
        res.json({error: "Error: Emails don't match!"});
      }
      else {
        user.save(function(err, u) {
          var uid = u._id;
          var token = jwt.sign({ uid: uid }, 'secret');
          res.json({ message: 'User Authenticated', user: user, new_account: new_account, token: token });
        });
      }
    });
  });
});


router.route('/locations').get(function(req, req_response) {
  FB.api('oauth/access_token', {
      client_id: keys.fb_client_id,
      client_secret: keys.fb_client_secret,
      grant_type: 'client_credentials'
    },
    function(res) {
      if (!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
      }
    
      console.log(res);

      FB.setAccessToken(res.access_token);
      FB.api('/search', 'GET', {
              "type": "place",
              "center": req.query.lat + "," + req.query.lon,
              "distance": "5000",
              "limit": "200"
        },
        function(response) {
          var promises = []; 
          response.data.forEach(function(l) {
            var promise = new Promise(function (resolve, reject) {
              Location.findOne({
                  'place_id': l.id
                },
                function(err, location) {
                  if (err || location == null) {
                    //create a new one
                    location = new Location();
                    location.name = l.name;
                    location.place_id = l.id;
                    location.location.coordinates = [l.location.longitude, l.location.latitude];
                    location.save(function(err,location) {
                      resolve(location);
                    }); 
                  }
                  else {
                      resolve(location);
                  }
                }
              );
            });
            
            promises.push(promise);
          });
            
          Promise.all(promises).then(function(res) {
            req_response.json({'locations': res});
          });
        }
      );
    }
  );
});

module.exports = router;