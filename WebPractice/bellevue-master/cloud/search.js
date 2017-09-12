var searchContent = function(req, response) {
  var query = req.params.query;

  // Connection URL
  var url = 'mongodb://heroku_5zt1907k:4abn56rd5rum1ujdtq6vniqd7b@ds119748.mlab.com:19748/heroku_5zt1907k';
  var MongoClient = require('mongodb').MongoClient, assert = require('assert');

  var findDocuments = function(db, query, callback) {
    // Get the documents collection
    var _ = require("underscore");
    var collection = db.collection("_User");
    // Find some documents
    collection.find({$text:{$search:query}}, {username:1}).toArray(function(err, docs) {
      assert.equal(err, null);

      var parsedIds = _.map(docs, function(doc) { return doc['_id']; });
      //console.log(parsedIds);
      callback(parsedIds);
    });
  }

  var findQuestions = function(db, query, callback) {
    // Get the documents collection
    var collection = db.collection("Question");
    // Find some documents
    collection.find({$text:{$search:query}}, {QuestionText:1}).toArray(function(err, docs) {
      assert.equal(err, null);

      var _ = require("underscore");
      var parsedIds = _.map(docs, function(doc) { return doc['_id']; });
      callback(parsedIds);
    });
  }

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

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    findDocuments(db, query, function(parsedIds) {
        dummyUserResult = parsedIds;
        findQuestions(db, query, function(questionIds){
          dummyUserResult = parsedIds;
          dummyQuestionResult = questionIds;

          var userQuery = new Parse.Query(Parse.User);
          userQuery.containedIn("objectId", dummyUserResult);
          userQuery.find({
            success: function(results) {
              var Answer = Parse.Object.extend("Question");
              var answerQuery = new Parse.Query(Answer);
              answerQuery.include("Asker");
              answerQuery.include("Answerer");
              answerQuery.equalTo('Private', false);
              answerQuery.equalTo('Answered', true);
              answerQuery.containedIn("objectId", dummyQuestionResult);
              answerQuery.find({
                  success: function(answerResult) {
                    response.success({
                      status: "success",
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
          db.close();
        });
      });
    });
}

module.exports.searchContent = searchContent