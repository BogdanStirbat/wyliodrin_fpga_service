var express = require("express");
var app = express();
var path = require("path");
var application_root = __dirname;

var settings = require ('./settings.js');

app.configure(function () {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(application_root, "public")));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get("/", function(req, res){
	res.send("wyliodrin_fpga_service started");
});

app.post("/build", function(req, res){
	console.log(req.body);
	console.log(req.body.archive_url);
	console.log(req.body.type);
	res.send("ok build");
});

app.get("/load", function(req, res){
	res.send("ok load");
});

console.log("buildFolder: " + settings.buildFolder);
console.log("sec_to_timeout: " + settings.sec_to_timeout);
console.log("nr_parallel_builds: " + settings.nr_parallel_builds);
app.listen(settings.port, "localhost", function(){
	console.log("server started on port: " + settings.port);
});
