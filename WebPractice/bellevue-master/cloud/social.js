var follow = function(req, res) {
  var userId = req.params.userId;
  var userIdToFollow = req.params.userIdFollowing;
  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(userA) {
      var queryUserToFollow = new Parse.Query(Parse.User);
      queryUserToFollow.get(userIdToFollow, {
        success: function(userB) {
          userA.addUnique("Following", userIdToFollow);
          userA.save(null, {
            useMasterKey:true,
            success: function(updatedUserA) {
              userB.addUnique("FollowedBy", userId);
              userB.save(null, {
                useMasterKey: true,
                success: function(updatedUserB) {
                  res.success({
                    status: "success"
                  });
                },
                error: function(object, error) {
                  res.error('Error: user updating failure' + userIdToFollow);
                }
              });
            },
            error: function(object, error) {
              res.error('Error: user updating failure' + userId);
            }
          });
        },
        error: function(object, error) {
          res.error('Error: resolve user ' + userIdToFollow);
      	}
      });
    },
    error: function(object, error) {
      res.error('Error: resolve user ' + userId);
  	}
  });
}

var unfollow = function(req, res) {
  var userId = req.params.userId;
  var userIdToFollow = req.params.userIdFollowing;
  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(userA) {
      var queryUserToFollow = new Parse.Query(Parse.User);
      queryUserToFollow.get(userIdToFollow, {
        success: function(userB) {
          userA.remove("Following", userIdToFollow);
          userA.save(null, {
            useMasterKey:true,
            success: function(updatedUserA) {
              userB.remove("FollowedBy", userId);
              userB.save(null, {
                useMasterKey: true,
                success: function(updatedUserB) {
                  res.success({
                    status: "success"
                  });
                },
                error: function(object, error) {
                  res.error('Error: user updating failure' + userIdToFollow);
                }
              });
            },
            error: function(object, error) {
              res.error('Error: user updating failure' + userId);
            }
          });
        },
        error: function(object, error) {
          res.error('Error: resolve user ' + userIdToFollow);
      	}
      });
    },
    error: function(object, error) {
      res.error('Error: resolve user ' + userId);
  	}
  });
}

var likeAnswer = function(req, res) {
  var userId = req.params.userId;
  var questionId = req.params.questionId;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(user) {
      var question = Parse.Object.extend("Question");
      var questionQuery = new Parse.Query(question);
      questionQuery.get(questionId, {
        success: function(question) {
          var likedAnswers = user.get('LikedAnswers');
          var numLiked = question.get('NumLiked');

          // User owned this answer
          if (likedAnswers.indexOf(questionId) >= 0) {
            res.success({
              status: "success",
              numLiked: numLiked
            });
          }
          else {
            user.addUnique('LikedAnswers', questionId);
            user.save(
              null, {
              useMasterKey: true,
              success: function(user) {
                question.increment("NumLiked");
                question.save(null, {
                  success: function(question) {
                    res.success({
                      status: "success",
                      numLiked: question.get('NumLiked')
                    });
                  },
                  error: function(answerer, error) {
                    res.error("Question object update failed: " + error.code + " " + error.message);
                  }
                });
              },
              error: function(user, error) {
                res.error("User object update failed: " + error.code + " " + error.message);
              }
            });
          }
        },
        error: function(object, error) {
          res.error('Error: resolve answer ' + questionId);
      	}
      });
    },
    error: function(object, error) {
      res.error('Error: resolve user ' + userId);
  	}
  });
}

var unlikeAnswer = function(req, res) {
  var userId = req.params.userId;
  var questionId = req.params.questionId;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(user) {
      var question = Parse.Object.extend("Question");
      var questionQuery = new Parse.Query(question);
      questionQuery.get(questionId, {
        success: function(question) {
          var likedAnswers = user.get('LikedAnswers');
          var numLiked = question.get('NumLiked');

          // User noe liked this answer
          if (likedAnswers.indexOf(questionId) < 0) {
            res.success({
              status: "success",
              numLiked: numLiked
            });
          }
          else {
            user.remove('LikedAnswers', questionId);
            user.save(
              null, {
              useMasterKey: true,
              success: function(user) {
                question.increment("NumLiked", -1);
                question.save(null, {
                  success: function(question) {
                    res.success({
                      status: "success",
                      numLiked: question.get('NumLiked')
                    });
                  },
                  error: function(answerer, error) {
                    res.error("Question object update failed: " + error.code + " " + error.message);
                  }
                });
              },
              error: function(user, error) {
                res.error("User object update failed: " + error.code + " " + error.message);
              }
            });
          }
        },
        error: function(object, error) {
          res.error('Error: resolve answer ' + questionId);
      	}
      });
    },
    error: function(object, error) {
      res.error('Error: resolve user ' + userId);
  	}
  });
}

module.exports.follow = follow
module.exports.unfollow = unfollow
module.exports.likeAnswer = likeAnswer
module.exports.unlikeAnswer = unlikeAnswer
