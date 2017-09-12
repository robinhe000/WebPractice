var express = require('express');
var app = express();
var Parse = require('parse/node');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
const resolve = require('path').resolve;

// var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var databaseUri = "mongodb://heroku_5zt1907k:4abn56rd5rum1ujdtq6vniqd7b@ds119748.mlab.com:19748/heroku_5zt1907k";

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  appName: 'AnswerGalaxy',
  masterKey: process.env.MASTER_KEY || 'JoinedPrice', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:5000/parse',  // Don't forget to change to https if needed
  liveQuery: {
    //classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
    classNames: [] // List of classes to support for query subscriptions
  },
  publicServerURL: 'http://www.answergalaxy.com/parse',
  verifyUserEmails: true,
  emailAdapter: {
    module: 'parse-server-mailgun',
    options: {
      // The address that your emails come from
      fromAddress: 'AnswerGalaxy <noreply@answergalaxy.com>',
      // Your domain from mailgun.com
      domain: 'mail.answergalaxy.com',
      // Your API key from mailgun.com
      apiKey: 'key-c650f2b39cc83a45dd0df9f12caec0d0',
      // The template section
      templates: {
        passwordResetEmail: {
          subject: 'Reset your password',
          pathPlainText: resolve(__dirname, 'templates/password_reset_email.txt'),
          pathHtml: resolve(__dirname, 'templates/password_reset_email.html'),
          callback: (user) => { return { firstName: user.get('firstName') }}
          // Now you can use {{firstName}} in your templates
        },
        verificationEmail: {
          subject: 'Confirm your account',
          pathPlainText: resolve(__dirname, 'templates/verification_email.txt'),
          pathHtml: resolve(__dirname, 'templates/verification_email.html'),
          callback: (user) => { return { firstName: user.get('firstName') }}
          // Now you can use {{firstName}} in your templates
        },
        customEmailAlert: {
          subject: 'Urgent notification!',
          pathPlainText: resolve(__dirname, 'path/to/templates/custom_alert.txt'),
          pathHtml: resolve(__dirname, 'path/to/templates/custom_alert.html'),
        }
      }
    }
  }
});

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use('/', express.static(path.join(__dirname, '/public/testwebpage')));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// app.get('/', function(request, response) {
//   response.render('pages/index');
// });


// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/testParse', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});
// app.get('/', function(req, res) {
//   console.log('OK')
//   res.sendFile(path.join(__dirname, '/public/testwebpage/me.html'));
// });
app.get('/', function(request, response) {
  response.render('webpage/search.ejs',{
    "name" : "Jeff Larson",
    "photo": "./public/testwebpage/picture/questionicon.svg",
    "hotTopic1" : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis cum odit, consectetur sapiente nobis! Laboriosam culpa, necessitatibus magnam! Repudiandae saepe laborum inventore. Ea voluptas rerum tenetur quibusdam accusantium quo at.",
    "photo2": "./public/testwebpage/picture/users.jpg"
  });
});
app.get('/search', function(request, response) {
   response.render('webpage/search.ejs',{
      "name" : "Jeff Larson",
      "photo": "./public/testwebpage/picture/questionicon.svg",
      "hotTopic1" :  "black lives matter black lives matteblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matter black lives matterblack lives matterblack lives matter",
   });
});
app.get('/explore', function(request, response) {
  Parse.Cloud.run('getPopularContent').then(function(result){
    var userlist = result["user"];
  response.render('webpage/explore.ejs',{
      "name" : "Jeff Larson",
      "photo": "./public/testwebpage/picture/questionicon.svg",
      "hotTopic1" :  "black lives matter black lives matteblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matterblack lives matter black lives matterblack lives matterblack lives matter",
      "userlist":userlist
   });
  });
});
app.get('/aboutapp', function(request, response){
  response.render('webpage/aboutapp.ejs');
});

app.get('/aboutus',function(request, response){
  response.render('webpage/aboutus.ejs');
});
app.get('/backup', function(request, response) {
  response.render('pages/indexBackup');
});

app.get('/test', function(request, response) {
  response.render('pages/test');
});

app.get('/christmas', function(request, response) {
  response.render('pages/luck');
});

// app.get('/debug', function(request, response) {
//   response.render('pages/debug');
// });

app.get('/debug2', function(request, response) {
  response.render('pages/debug2');
});

//var userLogin = require('login')
require('./routes/login');
//app.get('/login', userLogin.get);

app.get('/search', function(request, response) {
  response.render('pages/queryDebug');
});

app.get('/user/:id', function(request, response) {
  //response.send('Response send to client::'+ request.params.id);
  var User = Parse.Object.extend(Parse.User);
  var query = new Parse.Query(User);
  query.get(request.params.id, {
    success: function(user) {
      Parse.Cloud.run('GetUserFeeds', {userId: user.id}).then(function(feedanswers) {
        Parse.Cloud.run('GetFollowing', {userId: user.id}).then(function(userfollowing) {
          var Answer = Parse.Object.extend('Question');
          var answersQuery = new Parse.Query(Answer);
          answersQuery.equalTo("Answerer", user);
          answersQuery.find({
            success: function(results) {
              response.render('pages/user',
              {
                'userid' : request.params.id,
                'userObject' : user,
                'relatedAnswers': results,
                'userFeed': feedanswers,
                'userFollowing': userfollowing
              });
            },
            error: function(object, error) {
              response.send('Error: cannot get related questions. - ' + error);
            }
          });
        });
      });

    },
    error: function(object, error) {
      response.send('Error: user not found.');
    }
  });
});

app.get('/answer/:id', function(request, response) {
  //response.send('Response send to client::'+ request.params.id);
  var Question = Parse.Object.extend('Question');
  var query = new Parse.Query(Question);
  query.include("Asker");
  query.include("Answerer");
  query.get(request.params.id, {
    success: function(answer) {
      response.render('pages/answer',
      {
        'answerid' : request.params.id,
        'answerObject' : answer,
        'asker': answer.get('Asker'),
        'answerer': answer.get('Answerer')
      });
    },
    error: function(object, error) {
      response.send('Error: user not found.');
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
