

  var imap = require("imap");
  exports.getEmails = function(config, callback) {
      var unreads = [], exitOnErr, server;

     server = new imap.ImapConnection({
        username: config.username,
        password: config.password,
        host: config.host,
        port: config.port,
        secure: config.secure === "true"
      });

      exitOnErr = function(err) {
        console.error(err);
        return false;
      };

      server.connect(function(err) {
        if (err) {
          return exitOnErr(err);
        }
        return server.openBox("INBOX", false, function(err, box) {
          if (err) {
            return exitOnErr(err);
          }
          console.log("You have " + box.messages.total + " messages in your INBOX");
          return server.search(["UNSEEN", ["SINCE", "Sep 18, 2011"]], function(err, results) {
            var fetch;
            if (err) {
              return exitOnErr(err);
            }
            if (!results.length) {
              console.log("No unread messages from " + config.email);
              callback(unreads);
              server.logout();
              return;
            }
            fetch = server.fetch(results, {
                headers: ["from", "to", "subject", "date"],
                cb: function(fetch) {
                    fetch.on("message", function(msg) {
                        msg.on("headers", function(headers){
                            unreads.push(headers);
                        });
                    });
                    fetch.on("end", function() {
                      server.logout();
                      callback(unreads);
                    });
            }}, function(err) {
                server.logout();
            });
          });
        });
      });
  };
