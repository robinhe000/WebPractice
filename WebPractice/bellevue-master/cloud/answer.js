var common = require('./common');

var askQuestion = function(req, res) {
  var userIdA = req.params.askerId;
  var userIdB = req.params.answererId;
  var questionText = req.params.questionText;
  var isPrivate = req.params.isPrivate;

  var query = new Parse.Query(Parse.User);
  query.get(userIdA, {
  	success: function(userA) {
      var answererQuery = new Parse.Query(Parse.User);
      answererQuery.get(userIdB, {
        success: function(userB) {
          var balance = userA.get("Coin");
          var cost = userB.get("Price");
          var listenCost = userB.get("ListenPrice");

          var newBalance = balance - cost;
          if (newBalance >= 0) {
            var Question = Parse.Object.extend("Question");
            var testQuestion = new Question();

            testQuestion.set("QuestionText", questionText);
            testQuestion.set("Asker", userA);
            testQuestion.set("Answerer", userB);
            testQuestion.set("Answered", false);
            testQuestion.set("Expired", false);
            testQuestion.set("Private", isPrivate);
            testQuestion.set("Declined", false);

            testQuestion.set("NumLiked", 0);
            testQuestion.set("NumListened", 0);
            testQuestion.set("Cost", cost);
            testQuestion.set("ListenPrice", listenCost);

            testQuestion.save(null, {
              success: function(question) {
                //console.log('New question created with Id: ' + question.id);
                userA.increment("Coin", -cost);
                userA.addUnique("OwnedAnswers", question.id);
                userA.save(
                  null, {
                  useMasterKey:true,
                  success: function(user) {
                    var Transaction = Parse.Object.extend("Transaction");
                    var transaction = new Transaction();

                    transaction.set("UserA", user);
                    transaction.set("UserB", userB)
                    transaction.set("Operation", "Ask");
                    transaction.set("Credit", 0-cost);

                    transaction.save(null, {
                      success: function(transaction) {
                        res.success({
                          status: "success",
                          balance: newBalance
                        });
                      },
                      error: function(transaction, error) {
                        res.success({
                          status: "success_log_fail",
                          balance: newBalance
                        });
                      }
                    });
                  },
                  error: function(user, error) {
                    res.error("User object update failed: " + error.code + " " + error.message);
                  }
                });
              },
              error: function(question, error) {
                res.error('Failed to create new question object, with error code: ' + error.message);
              }
            });
          } else {
            res.error({
              status: common.status_fail_insufficientcoins,
              errorMessage: 'User does not have sufficient coins.',
              debugInfo: 'Error: insufficient coins: ' + userIdA
            });
          }
        },
        error: function(object, error) {
          res.error('Error: retrieve user ' + userIdB);
      	}
      });
    },
    error: function(object, error) {
      res.error('Error: retrieve user ' + userIdA);
  	}
  });
}

var answerQuestion = function(req, res) {
  var questionId = req.params.questionId;
  var recordingId = req.params.recordingId;

  var Answer = Parse.Object.extend("Question");
  var queryQuestion = new Parse.Query(Answer);

  queryQuestion.get(questionId, {
  	success: function(question) {
      var Recording = Parse.Object.extend("AnswerRecording");
      var queryRecording = new Parse.Query(Recording);
      queryRecording.include("Answerer");
      queryRecording.get(recordingId, {
        success: function(recording) {
          question.set("AnswerRecording", recording);
          question.set("Answered", true);
          question.save(
            null, {
            success: function(updatedQuestion) {
              var answerer = updatedQuestion.get("Answerer");
              var cost = updatedQuestion.get("Cost");

              // TODO: Write to application log
              console.log("Cost: " + cost);
              console.log("Answerer: " + answerer.id);

              answerer.increment("Credit", cost * 100);
              answerer.addUnique("OwnedAnswers", updatedQuestion.id);
              answerer.save(null, {
                useMasterKey:true,
                success: function(answerer) {
                  var asker = updatedQuestion.get("Asker");
                  asker.addUnique("OwnedAnswers", updatedQuestion.id);
                  asker.save(
                    null,
                    {
                      useMasterKey:true,
                      success: function(asker) {
                        res.success({
                          status: "success"
                        });
                      },
                      error: function(object, error) {
                        res.error("Error: " + error.code + " " + error.message);
                      }
                    }
                  );
                },
                error: function(answerer, error) {
                  res.error("Answerer object update failed: " + error.code + " " + error.message);
                }
              });

            },
            error: function(updatedQuestion, error) {
              res.error("Question object update failed: " + error.code + " " + error.message);
            }
          });
        },
        error: function(object, error) {
          res.error("Object Lookup Failed: " + error.code + " " + error.message);
        }
      });
    },
    error: function(object, error) {
      res.error("Object Lookup Failed: " + error.code + " " + error.message);
    }
  });
}

var declineQuestion = function(req, res) {
  var questionId = req.params.questionId;
  var question = Parse.Object.extend("Question");
  var questionQuery = new Parse.Query(question);
  questionQuery.include("Asker");
  questionQuery.get(questionId, {
    success: function(questionObj) {
      asker = questionObj.get('Asker');
      cost = questionObj.get('Cost');

      if (questionObj.get("Declined") == true) {
        res.success({status: "success"});
      }
      else {
        asker.increment("Coin", cost);
        asker.save(
          null, {
          useMasterKey: true,
          success: function(user) {
            questionObj.set("Declined", true);
            questionObj.save(null, {
              success: function(question) {
                res.success({
                  status: "success"
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
}

var listen = function(req, res) {
  var userIdA = req.params.userId;
  var answerId = req.params.questionId;

  var query = new Parse.Query(Parse.User);
  query.get(userIdA, {
  	success: function(userA) {
      var Answer = Parse.Object.extend("Question");
      var answererQuery = new Parse.Query(Answer);
      answererQuery.include("AnswerRecording");
      answererQuery.get(answerId, {
        success: function(answer) {
          var ownedAnswers = userA.get("OwnedAnswers");
          var balance = userA.get("Coin");
          var answerRecording = answer.get("AnswerRecording");

          // User owned this answer
          if (ownedAnswers.indexOf(answerId) >= 0) {
            res.success({
              status: "success",
              answer: answerRecording,
              balance: balance
            });
          }
          else {
            var cost = 1;
            var newBalance = balance - cost; // really?
            if (newBalance >= 0) {
              userA.increment("Coin", -cost);
              userA.addUnique("OwnedAnswers", answerId);
              userA.save(
                null, {
                useMasterKey:true,
                success: function(user) {
                  var Transaction = Parse.Object.extend("Transaction");
                  var transaction = new Transaction();

                  transaction.set("UserA", user);
                  transaction.set("UserB", answer)
                  transaction.set("Operation", "Listen");
                  transaction.set("Credit", 0-cost);

                  transaction.save(null, {
                    success: function(transaction) {
                      res.success({
                        status: common.status_success,
                        answer: answerRecording,
                        balance: newBalance
                      });
                    },
                    error: function(transaction, error) {
                      res.success({
                        status: "success_log_fail",
                        answer: answerRecording,
                        balance: newBalance
                      });
                    }
                  });
                },
                error: function(user, error) {
                  res.error("User object update failed: " + error.code + " " + error.message);
                }
              });
            } else {
              res.error({
                status: common.status_fail_insufficientcoins,
                errorMessage: 'User does not have sufficient coins',
                debugInfo: 'Error: insufficient coins: ' + userIdA
              });
            }
          }
        },
        error: function(object, error) {
          res.error('Error: retrieve answer ' + answerId);
      	}
      });
    },
    error: function(object, error) {
      res.error({
        status: common.status_fail_usernotfound,
        errorMessage: "Invalid User",
        debugInfo: 'Error: retrieve user ' + userIdA
        });
  	}
  });
}

module.exports.answerQuestion = answerQuestion
module.exports.declineQuestion = declineQuestion
module.exports.askQuestion = askQuestion
module.exports.listen = listen
