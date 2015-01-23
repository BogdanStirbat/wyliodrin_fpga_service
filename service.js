var express = require("express");
var app = express();
var path = require("path");
var child_process = require('child_process');
var exec = require('child_process').exec;
var random_string = require('./random_string.js');
var application_root = __dirname;

var settings = require ('./settings.js');
var random_string = require('./random_string.js');
var build_state = require('./build_state.js');

function findValueOfTag(build_time_raw, text_id) {
	var result = "";
	var pos = build_time_raw.indexOf(text_id);
	var sub_text = build_time_raw.substring(0, pos);
	var sub_pos = sub_text.lastIndexOf(' ');
	if (sub_pos<0) {
		sub_pos = 0;
	} else {
		sub_pos++;
	}
	result = sub_text.substring(sub_pos, sub_text.length);
	return result;
}

function parseBuildTime(build_time_raw) {
	var result = {};
	result["user"] = findValueOfTag(build_time_raw, "user");
	result["system"] = findValueOfTag(build_time_raw, "system");
	result["elapsed"] = findValueOfTag(build_time_raw, "elapsed");
	result["CPU"] = findValueOfTag(build_time_raw, "CPU");
	return result;
}

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
		build_time = parseBuildTime(build_time.trim());
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
		if (build_state.getNumberOfRunningBuilds() >= settings.nr_parallel_builds) {
			var response = {"status": "build not started, server too busy", "url": archive_url};
	        res.send(response);
			return;
		}
		if (build_state.isBuildInRunningBuilds(archive_url)) {
			var response = {"status": "build running, not finished", "url": archive_url};
	        res.send(response);
			return;
		}
		if (build_state.isBuildInFinishedBuilds(archive_url)) {
			var build_info = build_state.getBuildFromFinishedBuilds(archive_url);
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
			var build_info = build_state.getBuildFromRunningBuilds(archive_url);
			build_info.status = "FINISHED";
			build_info.result = result;
			build_state.pushBuildToFinishedBuilds(build_info);
			build_state.removeBuildFromRunningBuilds(archive_url);
		});
		var build_info = {"url": archive_url, "build_path": settings.buildFolder + "/" + random_folder, "status": "IN_PROGRESS", "result": {}};
		build_state.pushBuildToRunningBuilds(build_info);
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
		if (build_state.isBuildInFinishedBuilds(archive_url)) {
			var build_info = build_state.getBuildFromFinishedBuilds(archive_url);
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
			build_state.removeBuildFromFinishedBuilds(archive_url);
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
	var number_of_builds = build_state.getNumberOfRunningBuilds();
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
