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

module.exports = router;
