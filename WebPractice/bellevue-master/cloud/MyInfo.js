var _ = require("underscore");

var printErrorMessage = function(error) {
  response.error("Error: " + error.code + " " + error.message);
}

var updateUserInfo = function(request, response) {
  var userId = request.params.userId;
  var userFirstName = request.params.userFirstName;
  var userLastName = request.params.userLastName;
  var userTitle = request.params.userTitle;
  var userDesc = request.params.userDesc;
  var avatarData = request.params.avatarData;
  var userQuery = new Parse.Query(Parse.User);

  userQuery
  .get(userId)
  .then(function(user) {
    var parseFile = new Parse.File("useravatar.jpg", avatarData)
    return parseFile.save().then(function(){
      user.set('name', userFirstName)
      user.set('LastName', userLastName)
      user.set('Title', userTitle)
      user.set('Description', userDesc)
      user.set('Avatar', parseFile)
      return user.save(null, {useMasterKey:true})
    });
  }, printErrorMessage)
  .then(function(obj) {
    response.success({status: "success"})
  }, printErrorMessage);
}

var updatePrice = function(request, response) {
  var userId = request.params.userId;
  var newPrice = request.params.newPrice;
  var newListenPrice = request.params.newListenPrice;
  var userQuery = new Parse.Query(Parse.User);

  userQuery
  .get(userId)
  .then(function(user) {
    user.set('Price', newPrice)
    user.set('ListenPrice', newListenPrice)
    return user.save(null, {useMasterKey:true})
  }, printErrorMessage)
  .then(function(obj) {
    response.success({
      status: "success",
      newPrice: newPrice
    });
  }, printErrorMessage);
}

var myQuestions = function(request, response) {
  var userId = request.params.userId;
  var userQuery = new Parse.Query(Parse.User);
  userQuery
  .get(userId)
  .then(function(user) {
    var question = Parse.Object.extend("Question");
    var questionQuery = new Parse.Query(question);
    questionQuery.include("Asker");
    questionQuery.include("Answerer");
    questionQuery.equalTo('Asker', user);
    return questionQuery
    .find()
    .then(function(questions) {
        var groupedAnswer = _.groupBy(questions, function(question) {
          return question.get('Answered');
        });

        var unanswered = _.filter(groupedAnswer['false'], function(question) {
          return (question.get('Declined') != true && question.get('Expired') != true);
        });

        var declined = _.filter(groupedAnswer['false'], function(question) {
          return (question.get('Declined') == true);
        });

        var expired = _.filter(groupedAnswer['false'], function(question) {
          return (question.get('Declined') != true && question.get('Expired') == true);
        });

        response.success({
          status: "success",
          answered: groupedAnswer['true'],
          unanswered: unanswered,
          declined: declined,
          expired: expired
        });
      }, printErrorMessage);
    }, printErrorMessage);
}

var myAnswers = function(request, response) {
  var userId = request.params.userId;
  var userQuery = new Parse.Query(Parse.User);
  userQuery.get(userId, {
    success: function(user) {
      var question = Parse.Object.extend("Question");
      var questionQuery = new Parse.Query(question);
      questionQuery.include("Asker");
      questionQuery.include("Answerer");
      questionQuery.equalTo('Answerer', user);
      questionQuery.notEqualTo('Declined', true);
      questionQuery.find({
        success: function(questions) {
          var groupedAnswer = _.groupBy(questions, function(question) {
            return question.get('Answered');
          });
          response.success({
            status: "success",
            answered: groupedAnswer['true'],
            unanswered: groupedAnswer['false']
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
}

var myListened = function(request, response) {
  var userId = request.params.userId;
  var userQuery = new Parse.Query(Parse.User);
  userQuery.get(userId, {
    success: function(user) {
      var owned = user.get('OwnedAnswers');
      var question = Parse.Object.extend("Question");
      var questionQuery = new Parse.Query(question);
      questionQuery.include("Asker");
      questionQuery.include("Answerer");
      questionQuery.containedIn('objectId', owned);
      questionQuery.equalTo('Answered', true);
      questionQuery.find({
        success: function(questions) {
          response.success(questions);
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
}

var getFollowing = function(request, response) {
  var userId = request.params.userId;
  var userQuery = new Parse.Query(Parse.User);
  userQuery.get(userId, {
      success: function(user)
      {
        following = user.get("Following");
        var followingQuery = new Parse.Query(Parse.User);
        followingQuery.containedIn("objectId", following);
        followingQuery.find({
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
}

module.exports.myQuestions = myQuestions;
module.exports.myAnswers = myAnswers;
module.exports.myListened = myListened;
module.exports.getFollowing = getFollowing;
module.exports.updatePrice = updatePrice;
module.exports.updateUserInfo = updateUserInfo;
