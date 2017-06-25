/* --------------------------------------------------------------------------
 *  Modules
 * -------------------------------------------------------------------------- */

var fs          = require('fs');
var express     = require('express');
var jsonfile    = require('jsonfile');

var router      = express.Router();

/* --------------------------------------------------------------------------
 *  Routes
 * -------------------------------------------------------------------------- */

router.get("/", function(request, response, next) {
    /*  Return the projects list
     *
     *  http://localhost:3000/projects/
     *
     *  Returns
     *  -------
     *  json
     *      Jobs list as json structure
     */

    try {
        // Fetch projects
        var projects = [];
        if(fs.existsSync("data/projects.json"))
            projects = jsonfile.readFileSync("data/projects.json");

        // Fetch jobs data and push them into results
        if(projects.length > 0) {

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            // Replace user attribute in job with user data
            for(element in projects) {
                var project = projects[element];

                if("owner" in project)
                    project["owner"] = users[0][project["owner"]];

                for(member in project["members"]) {
                    var identifier = project["members"][member];

                    project["members"][member] = users[0][identifier];
                }
            }
        }

        response.json(projects);
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/project/:id", function(request, response, next) {
    /*  Return a specific project content
     *
     *  http://localhost:3000/projects/project/<id>
     *
     *  Parameters
     *  ----------
     *  id : int
     *      project identifier
     *
     *  Returns
     *  -------
     *  json
     *      User data
     */

    try {
        // Fetch projects
        var projects = [];
        if(fs.existsSync("data/projects.json"))
            projects = jsonfile.readFileSync("data/projects.json");

        // Json structure
        var project = undefined;

        // Fetch jobs data and push them into results
        if(projects.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            for(element in projects) {
                if(projects[element].id == id) {
                    project = projects[element];
                    break;
                }
            }

            // Replace user attribute in project with user data
            if(!(project == undefined)) {
                project.owner = users[0][project.owner];

                for(member in project.members) {
                    var identifier = project.members[member];

                    project.members[member] = users[0][identifier];
                }

                response.json(project);
            }
            else {
                response.sendStatus(404);
            }
        }
        else {
            response.sendStatus(404);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.post("/edit", function(request, response, next) {
    /*  Edit a specific project
     *
     *  http://localhost:3000/projects/edit
     *
     *  Returns
     *  -------
     *  json
     *      Project data
     */

    try {
        // Fetch projects
        var projects = [];
        if(fs.existsSync("data/projects.json"))
            projects = jsonfile.readFileSync("data/projects.json");

        // Project identifier
        if("id" in request.body) {
            var id = request.body.id;
            var edit = true;
        }
        else {
            var id = 1;
            for(project in projects) {
                if(projects[project].id >= id)
                    id = projects[project].id + 1;
            }
            var edit = false;
        }

        // Project data
        if(!edit) {
            projects.push({
                "id": parseInt(id),
                "status": false,
                "owner": request.body.owner,
                "date": new Date().toLocaleString(),
                "title": request.body.title,
                "description": {
                    "content": request.body.description,
                    "url": request.body.url
                },
                "members": [
                    request.body.owner
                ]
            });

            // Write json content
            jsonfile.writeFileSync("data/projects.json", projects, { spaces: 4 });

            response.json(JSON.stringify({
                project: parseInt(id) }));
        }
        else {
            var project = undefined;

            for(element in projects) {
                if(projects[element].id == id) {
                    project = projects[element];
                    break
                }
            }

            if(project != undefined) {
                data = {
                    "id": parseInt(request.body.id),
                    "status": request.body.status,
                    "title": request.body.title,
                    "description": {
                        "content": request.body.description,
                        "url": request.body.url
                    }
                };

                for(key in data) {
                    if(data[key] == undefined)
                        delete data[key];

                    if(key == "description") {
                        for(subkey in data[key]) {
                            if(data[key][subkey] != undefined)
                                project[key][subkey] = data[key][subkey];
                        }
                    }
                    else if(data[key] != undefined) {
                        project[key] = data[key];
                    }
                }

                // Write json content
                jsonfile.writeFileSync("data/projects.json", projects, { spaces: 4 });

                response.json(JSON.stringify({
                    project: parseInt(id) }));
            }
            else {
                response.sendStatus(404);
            }
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.post("/delete", function(request, response, next) {
    /*  Remove a specific project
     *
     *  http://localhost:3000/projects/delete
     */

    try {
        // Fetch projects
        var projects = [];
        if(fs.existsSync("data/projects.json"))
            projects = jsonfile.readFileSync("data/projects.json");

        // Project identifier
        if("id" in request.body) {
            var id = request.body.id;

            var project = undefined;

            for(element in projects) {
                if(projects[element].id == id) {
                    project = element;
                    break
                }
            }

            if(project != undefined) {
                projects.splice(project, 1);

                // Write json content
                jsonfile.writeFileSync("data/projects.json", projects, { spaces: 4 });

                response.sendStatus(200);
            }
            else {
                response.sendStatus(404);
            }
        }
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

module.exports = router;
