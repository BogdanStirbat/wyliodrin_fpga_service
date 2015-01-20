var express = require("express");
var app = express();
var path = require("path");
var application_root = __dirname;

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
	/*
	var build_data = JSON.parse(req.body);
	console.log("archive_url: " + build_data["archive_url"]);
	console.log("type: " + build_data["type"]);
	*/
	res.send("ok build");
});

app.get("/load", function(req, res){
	res.send("ok load");
});

app.listen(3000, "localhost", function(){
	console.log("server started");
});
