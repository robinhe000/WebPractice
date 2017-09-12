Parse.Cloud.beforeSave(Parse.User, function(request, response) {
    // Check if the User is newly created
    if (request.object.isNew()) {
        // Set default values
        request.object.set("OwnedAnswers", []);
        request.object.set("LikedAnswers", []);
        request.object.set("Following", []);
        request.object.set("FollowedBy", []);
        request.object.set("ContentProvider", false);
        request.object.set("Credit", 0);
        request.object.set("Coin", 0);
        request.object.set("Price", 10);
        request.object.set("ListenPrice", 1);
    }
    response.success();
});

Parse.Cloud.job("myJob", function(request, status) {
  // the params passed through the start request
  var params = request.params;
  // Headers from the request that triggered the job
  var headers = request.headers;

  var Answer = Parse.Object.extend("Question");
  var query = new Parse.Query(Answer);
  query.equalTo("Expired", false);
  query.equalTo("Answered", false);
  query.descending("createdAt");
  query.limit(10);

  query.find({
    success: function(results) {
      for (var i = 0; i < results.length; i++) {
      var object = results[i];
        var askTime = object.get('createdAt');
        var expireTime = new Date(askTime.getTime());
        expireTime.setHours(expireTime.getHours() + 48);
        var now = new Date();

        //console.log(now >= expireTime);
        if (now >= expireTime) {
          object.set("Expired", true);
          object.save(null, {
            success: function(question) {
            },
            error: function(error) {
            }
          });
        }
      }
    },
    error: function(error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });

});

Parse.Cloud.define('getPopularContent', function(req, response) {
  var category = req.params.category;

  var dummyUserResult = [
    "KarglFR4Ij",
    "b8ThAYRpHc",
    "2dv8cRbpBi",
    "LKyVRFFSRo"
  ];

  var dummyQuestionResult = [
    "BAMrAnC35B",
    "hGvFxpms6W",
    "G3Pnl1XNZs"
  ];

  if (category == 'health') {
    dummyUserResult = dummyUserResult.slice(0,2);
    dummyQuestionResult = dummyQuestionResult.slice(0,2);
  }

  if (category == 'travel') {
    dummyUserResult = dummyUserResult.slice(2,4);
    dummyQuestionResult = dummyQuestionResult.slice(1,3);
  }

  var userQuery = new Parse.Query(Parse.User);
  userQuery.containedIn("objectId", dummyUserResult);
  userQuery.find({
    success: function(results) {
      var Answer = Parse.Object.extend("Question");
      var answerQuery = new Parse.Query(Answer);
      answerQuery.include("Asker");
      answerQuery.include("Answerer");
      answerQuery.equalTo("Answered", true);
      answerQuery.equalTo("Private", false);
      answerQuery.containedIn("objectId", dummyQuestionResult);
      answerQuery.find({
          success: function(answerResult) {
            response.success({
              status: "success_dummy",
              user: results,
              answers: answerResult
            });
          },
          error: function(error) {
            response.error("Error: " + error.code + " " + error.message);
          }
      });
    },
    error: function(error) {
      response.error("Error: " + error.code + " " + error.message);
    }
  });
});

var search = require('./search');
Parse.Cloud.define('search', search.searchContent);

Parse.Cloud.define('GetUserFeeds', function(request, response) {
  var userId = request.params.userId;
  var userQuery = new Parse.Query(Parse.User);
  userQuery.get(userId, {
      success: function(user)
      {
        following = user.get("Following");

        var _ = require("underscore");
        var pointers = _.map(following, function(item_id) {
            var pointer = new Parse.User();
            pointer.id = item_id;
            return pointer;
        });
        //console.log(pointers);
        var Answer = Parse.Object.extend("Question");
        var query = new Parse.Query(Answer);
        query.include("Asker");
        query.include("Answerer");
        query.equalTo("Answered", true);
        query.equalTo("Private", false);
        query.containedIn("Answerer", pointers);
        query.limit(10);
        query.find({
          success: function(results) {
            response.success(results);
          },
          error: function(error) {
            response.error("Error: " + error.code + " " + error.message);
          }
        });
      },
      error: function(user, err)
      {
        response.error("Error: Unable to fetch user by Id " + userId);
      }
  });
});

function isAnswered(question) {
  return question.get('Answered');
}

function isNotAnswered(question) {
  return !question.get('Answered');
}

var myInfo = require('./MyInfo');

Parse.Cloud.define('MyQuestions', myInfo.myQuestions);
Parse.Cloud.define('MyAnswers', myInfo.myAnswers);
Parse.Cloud.define('MyListened', myInfo.myListened);
Parse.Cloud.define('GetFollowing', myInfo.getFollowing);
Parse.Cloud.define('UpdatePrice', myInfo.updatePrice);
Parse.Cloud.define('UpdateUserInfo', myInfo.updateUserInfo);

Parse.Cloud.define("GiveMeSomeUser", function(request, response) {
  var query = new Parse.Query(Parse.User);
  query.limit(5);
  query.find({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.error("Error: " + error.code + " " + error.message);
    }
  });
});

Parse.Cloud.define("GiveMeSomeAnswers", function(request, response) {
  var Answer = Parse.Object.extend("Question");
  var query = new Parse.Query(Answer);
  query.include("Asker");
  query.include("Answerer");
  query.equalTo('Answered', true);
  query.equalTo('Private', false);
  query.limit(5);
  query.find({
    success: function(results) {
      response.success(results);
    },
    error: function(error) {
      response.error("Error: " + error.code + " " + error.message);
    }
  });
});

var answer = require('./answer');
Parse.Cloud.define('AnswerQuestion', answer.answerQuestion);
Parse.Cloud.define('DeclineQuestion', answer.declineQuestion);
Parse.Cloud.define('AskQuestion', answer.askQuestion);
Parse.Cloud.define('Listen', answer.listen);

var social = require('./social');
Parse.Cloud.define('Follow', social.follow);
Parse.Cloud.define('UnFollow', social.unfollow);
Parse.Cloud.define('LikeAnswer', social.likeAnswer);
Parse.Cloud.define('UnlikeAnswer', social.unlikeAnswer);

var credit = require('./credit');
Parse.Cloud.define('addvalue', credit.addValue);
Parse.Cloud.define('withdraw', credit.withdraw);
Parse.Cloud.define('addcoins', credit.addCoins);
Parse.Cloud.define('convertcoins', credit.convert);

Parse.Cloud.define("averageStars", function(request, response) {
  var query = new Parse.Query("Review");
  query.equalTo("movie", request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get("stars");
      }
      response.success(computeDebug(sum, results.length));
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});
