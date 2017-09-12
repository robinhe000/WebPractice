var addCoins = function(req, res) {
  var userId = req.params.userId;
  var value = req.params.value;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
    success: function(userA) {
      var balance = userA.get("Coin");
      userA.increment("Coin", value);
      userA.save(
        null, {
        useMasterKey:true,
        success: function(user) {
          var newBalance = user.get('Coin');
          var Transaction = Parse.Object.extend("Transaction");
          var transaction = new Transaction();

          transaction.set("UserA", user);
          transaction.set("Operation", "AddCoin");
          transaction.set("Credit", value);

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
    error: function(object, error) {
      res.error('Error: retrieve user ' + userId);
    }
  });
}

var convert = function(req, res) {
  var userId = req.params.userId;
  var value = req.params.value;
  var code = req.params.discountCode;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
    success: function(userA) {
      if (value % 100 == 0) {
        
        var valueAfterDiscount = value;
        if (code == "START05") {
          valueAfterDiscount = value - (value / 20);
        }
        if (code == "START10") {
          valueAfterDiscount = value - (value / 10);
        }

        userA.increment('Credit', -valueAfterDiscount)
        if (userA.get('Credit') >= 0) {
          userA.increment("Coin", value / 100);
          userA.save(
            null, {
            useMasterKey:true,
            success: function(user) {
              var newBalance = user.get('Coin');
              var Transaction = Parse.Object.extend("Transaction");
              var transaction = new Transaction();

              transaction.set("UserA", user);
              transaction.set("Operation", "AddCoin");
              transaction.set("Credit", value);

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
        } else {
          res.error('Error: insufficient balance to convert - ' + value);
        }
      }
      else {
        res.error('Error: invalid value - ' + value);
      }
    },
    error: function(object, error) {
      res.error('Error: retrieve user ' + userId);
    }
  });
}

var addValue = function(req, res) {
  var userId = req.params.userId;
  var value = req.params.value;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(userA) {
      var balance = userA.get("Credit");
      var newBalance = balance + value; // really?

      //userA.set("Credit", newBalance);
      userA.increment("Credit", value);
      userA.save(
        null, {
        useMasterKey:true,
        success: function(user) {
          var Transaction = Parse.Object.extend("Transaction");
          var transaction = new Transaction();

          transaction.set("UserA", user);
          transaction.set("Operation", "AddValue");
          transaction.set("Credit", value);

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
    error: function(object, error) {
      res.error('Error: retrieve user ' + userId);
  	}
  });
}

var withdraw = function(req, res) {
  var userId = req.params.userId;
  var value = req.params.value;
  var email = req.params.paypalEmail;
  var name = req.params.paypalName;

  var query = new Parse.Query(Parse.User);
  query.get(userId, {
  	success: function(userA) {
      var balance = userA.get("Credit");
      var newBalance = balance - value; 

      if (newBalance < 0) {
        res.error("user don't have enough balance: " + userId);
      }
      else {
        userA.increment("Credit", -value);
        userA.save(
          null, {
          useMasterKey:true,
          success: function(user) {
            var Transaction = Parse.Object.extend("Transaction");
            var transaction = new Transaction();

            transaction.set("UserA", user);
            transaction.set("Operation", "Withdraw");
            transaction.set("Credit", 0-value);

            transaction.save(null, {
              success: function(transaction) {
                var Payment = Parse.Object.extend("Payment");
                var payment = new Payment();

                payment.set("paypalEmail", email);
                payment.set("paypalName", name);
                payment.set("creditToWithdraw", value);
                payment.set("status", 'Pending');
                payment.set("user", user);

                payment.save(null, {
                  success: function(updatedPayment) {
                      res.success({
                        status: "success",
                        balance: newBalance
                      });
                  },
                  error: function(updatedPayment, error) {
                    res.error("Internal error");
                  }
                });
              },
              error: function(transaction, error) {
                res.error("Internal error");
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
      res.error('Error: retrieve user ' + userId);
  	}
  });
}

module.exports.addValue = addValue
module.exports.withdraw = withdraw
module.exports.addCoins = addCoins
module.exports.convert = convert
