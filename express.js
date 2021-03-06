var inputs = {
    views: __dirname+"/assets/views/",
    assets: __dirname+"/assets/",
    port: 8080
}

//Express Init
var express = require("express"),
    app = express(),
    server = require("http").Server(app);

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

//express settings
app.set('views', inputs.views);
app.use(express.static(inputs.assets));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
        
server.listen(inputs.port);
console.log("Express server listening on port "+inputs.port);

module.exports = {
    express: express,
    app: app,
    server: server
}