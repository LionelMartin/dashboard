// Include http module.
var http = require("http");
var url = require('url');
var staticServer = require('node-static');
var staticController = new (staticServer.Server)('./public');
d = require("domain").create();
d.on("error", function(err) {
    console.log(err);
});
// Create the server. Function passed as parameter is called on every request made.
// request variable holds all request parameters
// response variable allows you to do anything with response sent to the client.
//
var emailController = function (request, response) {
    var imapReader = require("./lib/imap-reader.js");
    var query = url.parse(request.url, true).query;
    imapReader.getEmails(query, function(unreads) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify(unreads));
    });
}
var tvController = function(request, response) {
    var xmltv = require("./lib/xmltv-reader.js");
    xmltv.getXmlTv("/tmp/tvguide.xml", function(programmes) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify(programmes));
    });
};

var calendarController = function(request, response) {
    var query = url.parse(request.url, true).query;
    var icalReader = require("./lib/ical-reader.js");
    var endDate = new Date(Date.now() + 30*24*60*60*1000);
    icalReader.getEvents(query.cal, endDate, function(events) {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify(events));
    });
}
d.run(function(){
    http.createServer(function (request, response) {
        request.addListener('end', function(){
              var routes = [{
                  route: new RegExp('^/emails/?$'),
                  controller: emailController
              },
              {
                  route: new RegExp('^/calendar/?$'),
                  controller: calendarController
              },
              {
                  route: new RegExp("^/tv/?$"),
                  controller: tvController
              },
              {
                  route: true,
                  controller: staticController.serve.bind(staticController)
              }];
              var path = url.parse(request.url, true).pathname;
              var routeFound = false;
              var i=0, max = routes.length;
              while (!routeFound && i < max){
                  if (routes[i].route === true || routes[i].route.test(path)) {
                    routes[i].controller(request, response);
                    routeFound = true;
                  }
                  i++;
              }
              if (!routeFound) {
                  response.writeHead(404, {
                     'Content-Type': 'text/html'
                  });
                  response.end('Not Found');
              }
        }).resume();
    // Listen on the 8080 port.
    }).listen(8080);
});
