"use strict";
var StepNC = require('../../../../../STEPNode/build/Release/StepNC');
var file = require('./file');
var tol = file.tol;
var apt = file.apt;
var find = file.find;

var exeFromId = function(id) {
	let ws = {
		"id": id,
		"name": find.GetExecutableName(id)
	};
	if(find.IsEnabled(id))
		ws.enabled = true;
	else
		ws.enabled = false;
	if (find.IsWorkingstep(id)) {
		ws.type = "workingstep";
		ws.tool = find.GetWorkingstepTool(id);

		return ws;
	} else if (find.IsSelective(id)) {
		ws.type = "selective";
	} else if (find.IsWorkplan(id)) {
		ws.type = "workplan";
	}
	let children = find.GetNestedExecutableAll(id);
	if (children !== undefined) {
		ws.children = children.map(exeFromId);
	}
	return ws;
};

var _getExeFromId = function(req, res) {
	if (req.params.ncId && req.params.wsId !== undefined){
		let ncId = req.params.ncId;
		let wsId = req.params.wsId;
		let id_new = parseInt(wsId);
		find.OpenProject(file.getPath(ncId));
		let exe = exeFromId(id_new);
		if (exe !== undefined)
            res.status(200).send(exe);
		else {
			res.status(404).send("Executable not found");
		}
	}
	else {
		res.status(404).send("No workstep ID provided");
	}
};

var _getMwp = function(req, res) {
	if (req.params.ncId) {
		let ncId = req.params.ncId;
		find.OpenProject(file.getPath(ncId));
		let mwpId = find.GetMainWorkplan();
		res.status(200).send(exeFromId(mwpId));
	}
};


module.exports = function(app, cb) {
	//This route gets the executable given an Id and returns a JSON object with its
	//name, id and all its children (and children's children, etc.)
	app.router.get('/v2/nc/projects/:ncId/workplan/:wsId',_getExeFromId);

	//This route gets the main workplan for the project that is specified by
	//ncId
	app.router.get('/v2/nc/projects/:ncId/workplan',_getMwp);
	if (cb) cb();
};
