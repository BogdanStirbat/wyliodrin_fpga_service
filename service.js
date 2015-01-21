var express = require("express");
var app = express();
var path = require("path");
var child_process = require('child_process');
var exec = require('child_process').exec;
var random_string = require('./random_string.js');
var application_root = __dirname;

var settings = require ('./settings.js');
var random_string = require('./random_string.js');

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

function parseBuildOutputAndCreateResultAsJson(stdout, stderr) {
	var result;
	var output_lines = stdout.toString().split('\n');
	console.log("output_lines: " + output_lines);
	var build_result;
	var build_time;
	var dir_of_build;
	var bitfile_name;
	var bitfile_full_name;
	var last_build_result = "last build result:"
	var resulted_bit_file = "resulted .bit file:";
	var current_working_directory = "current working directory:";
	var user_time = "user";
	for(var i=0; i<output_lines.length; i++) {
		var output_line = output_lines[i];
		console.log("current_line: " + output_line);
		if (output_line.indexOf(last_build_result) == 0) {
			build_result = output_line.substring(last_build_result.length);
		}
		if (output_line.indexOf(resulted_bit_file) == 0) {
			bitfile_name = output_line.substring(resulted_bit_file.length);
		}
		if (output_line.indexOf(current_working_directory) == 0) {
			dir_of_build = output_line.substring(current_working_directory.length);
		}
		if (output_line.indexOf(user_time) == 0) {
			build_time = output_line.substring(user_time.length);
		}
	}
	if (build_result) {
		build_result = build_result.trim();
	}
	if (bitfile_name) {
		bitfile_name = bitfile_name.trim();
	}
	if (dir_of_build) {
		dir_of_build = dir_of_build.trim();
	}
	if (build_time) {
		build_time = build_time.trim();
	}

	bitfile_full_name = dir_of_build + "/" + bitfile_name;
	console.log('build_result: ' + build_result);
	console.log('build_time: ' + build_time);
	console.log('bitfile_full_name: ' + bitfile_full_name);

	return result;
}

app.post("/build", function(req, res){
	var archive_url = "";
	try {
		archive_url = req.body.archive_url;
		console.log("started build: " + archive_url);
		var random_folder = random_string.createRandomString(settings.nr_characters_in_random_folder);
		var command = "sh build_archive.sh " + settings.buildFolder + " " + random_folder + " " + archive_url;
		var command_timeout = 1000 * settings.sec_to_timeout;
		exec(command, {timeout: command_timeout}, function(error, stdout, stderr){
			console.log("stdout: ");
			console.log(stdout);
			console.log("stderr: ");
			console.log(stderr);
			if (error != null) {
				console.log('exec error: ');
				console.log(error);
			}
			parseBuildOutputAndCreateResultAsJson(stdout, stderr);
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
