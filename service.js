var express = require("express");
var app = express();
var path = require("path");
var child_process = require('child_process');
var exec = require('child_process').exec;
var random_string = require('./random_string.js');
var application_root = __dirname;

var settings = require ('./settings.js');
var random_string = require('./random_string.js');

function parseBuildOutputAndCreateResultAsJson(stdout, stderr) {
	var result = {};
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
		if (output_line.indexOf('user')>=0 && output_line.indexOf('system')>=0 && output_line.indexOf('elapsed')>=0) {
			build_time = output_line;
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

	result["build_result"] = build_result;
	result["build_time"] = build_time;
	result["bitfile_url"] = bitfile_full_name;

	return result;
}

var running_builds = [];
var finished_builds = [];

function listContainsBuild(listOfBuilds, archive_url) {
	if (!listOfBuilds) {
		return false;
	}
	if(listOfBuilds.length == 0) {
		return false;
	}
	for(var i=0; i<listOfBuilds.length; i++) {
		var current_build = listOfBuilds[i];
		if (current_build.url==archive_url) {
			return true;
		}
	}
	return false;
}

function findBuildInList(listOfBuilds, archive_url) {
	var empty_result = {};
	if (!listOfBuilds) {
		return empty_result;
	}
	if (listOfBuilds.length == 0) {
		return empty_result;
	}
	for(var i=0; i<listOfBuilds.length; i++) {
		var current_build = listOfBuilds[i];
		if (current_build.url==archive_url) {
			return current_build;
		}
	}
	return empty_result;
}

function findIndexOfBuildInList(listOfBuilds, archive_url) {
	if (!listOfBuilds) {
		return -1;
	}
	if (listOfBuilds.length == 0) {
		return -1;
	}
	for (var i=0; i<listOfBuilds.length; i++) {
		var current_build = listOfBuilds[i];
		if (current_build.url==archive_url) {
			return i;
		}
	}
	return -1;
}

function removeBuildFromList(listOfBuilds, archive_url) {
	var build_index = findIndexOfBuildInList(listOfBuilds, archive_url);
	if (build_index >= 0 && build_index < listOfBuilds.length) {
		listOfBuilds.splice(build_index, 1);
	}
}
 
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
		if (running_builds.length >= settings.nr_parallel_builds) {
			var response = {"status": "build not started, server too busy", "url": archive_url};
	        res.send(response);
			return;
		}
		if (listContainsBuild(running_builds, archive_url)) {
			var response = {"status": "build running, not finished", "url": archive_url};
	        res.send(response);
			return;
		}
		if (listContainsBuild(finished_builds, archive_url)) {
			var build_info = findBuildInList(finished_builds, archive_url);
			var build_result = build_info.result;
			var response = {"status": "build completed", "url": archive_url, "result": build_result};
	        res.send(response);
			return;
		}
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
			var result = parseBuildOutputAndCreateResultAsJson(stdout, stderr);
			var build_info = findBuildInList(running_builds, archive_url);
			build_info.status = "FINISHED";
			build_info.result = result;
			finished_builds.push(build_info);
			removeBuildFromList(running_builds, archive_url);
		});
		var build_info = {"url": archive_url, "build_path": settings.buildFolder + "/" + random_folder, "status": "IN_PROGRESS", "result": {}};
		running_builds.push(build_info);
		var response = {"status": "build started", "url": archive_url};
	    res.send(response);
	} catch(e) {
		console.log("error while build:" + e);
		var response = {"status": "error on request", "url": archive_url};
		res.send(response);
	}
});

app.post("/clean", function(req, res){
	var archive_url = "";
	try {
		archive_url = req.body.archive_url;
		if (listContainsBuild(finished_builds, archive_url)) {
			var build_info = findBuildInList(finished_builds, archive_url);
			var build_path = build_info.build_path;
			var remove_folder_command = "rm -r " + build_path;
			console.log("remove folder command: " + remove_folder_command);
			exec(remove_folder_command, function(error, stdout, stderr){
				console.log("stdout:");
				console.log(stdout);
				console.log("stderr:");
				console.log(stderr);
				if (error) {
					console.log("error:");
					console.log(error);
				}
			});
			removeBuildFromList(finished_builds, archive_url);
			var response = {"status": "cleanup performed", "url": archive_url};
	        res.send(response);
			return;
		} else {
			var response = {"status": "finished build not existent", "url": archive_url};
	        res.send(response);
			return;
		}

	} catch(e) {
		console.log("error while build:" + e);
		var response = {"status": "error on request", "url": archive_url};
		res.send(response);
	}
});

app.get("/load", function(req, res){
	var number_of_builds = running_builds.length;
	var max_number_of_builds = settings.nr_parallel_builds;
	var result={"number_of_builds":number_of_builds, "max_number_of_builds":max_number_of_builds};  
	res.send(result);
});

console.log("buildFolder: " + settings.buildFolder);
console.log("sec_to_timeout: " + settings.sec_to_timeout);
console.log("nr_parallel_builds: " + settings.nr_parallel_builds);
app.listen(settings.port, "localhost", function(){
	console.log("server started on port: " + settings.port);
});
