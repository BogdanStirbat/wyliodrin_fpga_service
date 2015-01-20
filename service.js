var express = require("express");
var app = express();
var path = require("path");
var child_process = require('child_process');
var exec = require('child_process').exec;
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
	var archive_url = "";
	try {
		archive_url = req.body.archive_url;
		console.log("started build: " + archive_url);
		var random_folder = "random_folder";
		var command = "sh build_archive.sh " + settings.buildFolder + " " + random_folder + " " + archive_url;
		var command_timeout = 1000 * settings.sec_to_timeout;
		exec(command, {timeout: command_timeout}, function(error, stdout, stderr){
			console.log("stdout: " + stdout);
			console.log("stderr: " + stderr);
			if (error != null) {
				console.log('exec error: ', error);
			}
		});
	} catch(e) {
		console.log("error while build:" + e);
		res.send("ok build did not completed successfully"); 
	}
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
