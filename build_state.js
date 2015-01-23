var running_builds = [];
var finished_builds = [];

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

function listContainsBuild(listOfBuilds, archive_url) {
	var build_index = findIndexOfBuildInList(listOfBuilds, archive_url);
	if (build_index>=0 && build_index<listOfBuilds.length) {
		return true;
	}
	return false;
}

function findBuildInList(listOfBuilds, archive_url) {
	var empty_result = {};
	var build_index = findIndexOfBuildInList(listOfBuilds, archive_url);
	if (build_index>=0 && build_index<listOfBuilds.length) {
		return listOfBuilds[build_index];
	}
	return empty_result;
}

function removeBuildFromList(listOfBuilds, archive_url) {
	var build_index = findIndexOfBuildInList(listOfBuilds, archive_url);
	if (build_index >= 0 && build_index < listOfBuilds.length) {
		listOfBuilds.splice(build_index, 1);
	}
}

function isBuildInRunningBuilds(archive_url) {
	return listContainsBuild(running_builds, archive_url);
}

function isBuildInFinishedBuilds(archive_url) {
	return listContainsBuild(finished_builds, archive_url)
}

function getBuildFromRunningBuilds(archive_url) {
	return findBuildInList(running_builds, archive_url);
}

function getBuildFromFinishedBuilds(archive_url) {
	return findBuildInList(finished_builds, archive_url);
}

function pushBuildToRunningBuilds(build_info) {
	running_builds.push(build_info);
}

function pushBuildToFinishedBuilds(build_info) {
	finished_builds.push(build_info);
}

function removeBuildFromRunningBuilds(archive_url) {
	removeBuildFromList(running_builds, archive_url);
}

function removeBuildFromFinishedBuilds(archive_url) {
	removeBuildFromList(finished_builds, archive_url);
}
 
function getNumberOfRunningBuilds() {
	return running_builds.length;
}

function getNumberOfFinishBuilds() {
	return finished_builds.length;
}

exports.isBuildInRunningBuilds = isBuildInRunningBuilds;
exports.isBuildInFinishedBuilds = isBuildInFinishedBuilds;
exports.getBuildFromRunningBuilds = getBuildFromRunningBuilds;
exports.getBuildFromFinishedBuilds = getBuildFromFinishedBuilds;
exports.pushBuildToRunningBuilds = pushBuildToRunningBuilds;
exports.pushBuildToFinishedBuilds = pushBuildToFinishedBuilds;
exports.removeBuildFromRunningBuilds = removeBuildFromRunningBuilds;
exports.removeBuildFromFinishedBuilds = removeBuildFromFinishedBuilds;
exports.getNumberOfRunningBuilds = getNumberOfRunningBuilds;
exports.getNumberOfFinishBuilds = getNumberOfFinishBuilds;