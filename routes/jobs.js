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
    /*  Return the jobs list
     *
     *  http://localhost:3000/jobs/
     *
     *  Returns
     *  -------
     *  json
     *      Jobs list as json structure
     */

    try {
        // Fetch jobs
        var jobs = [];
        if(fs.existsSync("data/jobs.json"))
            jobs = jsonfile.readFileSync("data/jobs.json");

        // Json structure
        var results = [];

        // Fetch jobs data and push them into results
        if(jobs.length > 0) {

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            // Replace user attribute in job with user data
            for(element in jobs[0]) {

                if("from" in jobs[0][element])
                    jobs[0][element]["user"] = users[0][jobs[0][element]["from"]];

                results.push(jobs[0][element]);
            }
        }

        response.json(results);
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/job/:id", function(request, response, next) {
    /*  Return a specific job content
     *
     *  http://localhost:3000/jobs/job/<id>
     *
     *  Parameters
     *  ----------
     *  id : int
     *      Job identifier
     *
     *  Returns
     *  -------
     *  json
     *      User data
     */

    try {
        // Fetch jobs
        var jobs = [];
        if(fs.existsSync("data/jobs.json"))
            jobs = jsonfile.readFileSync("data/jobs.json");

        // Json structure
        var results = undefined;

        // Fetch jobs data and push them into results
        if(jobs.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            // Replace user attribute in job with user data
            if("from" in jobs[0][id])
                jobs[0][id]["user"] = users[0][jobs[0][id]["from"]];

            results = jobs[0][id];
        }

        response.json(results);
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/job/:id/status/:status", function(request, response, next) {
    /*  Change status for a specific job
     *
     *  http://localhost:3000/jobs/<id>/status/<status>
     *
     *  Parameters
     *  ----------
     *  id : int
     *      Job identifier
     *  status : bool
     *      Job status
     *
     *  Returns
     *  -------
     *  json
     *      Job data
     */

    try {
        // Fetch jobs
        var jobs = [];
        if(fs.existsSync("data/jobs.json"))
            jobs = jsonfile.readFileSync("data/jobs.json");

        // Check jobs
        if(jobs.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];
            var status = (request.params["status"] == 'true');

            // Job exists in database
            if(id in jobs[0]) {
                jobs[0][id]["status"] = status;

                // Write json content
                jsonfile.writeFileSync("data/jobs.json", jobs, { spaces: 4 })

                response.sendStatus(200);
            }

            // Job not exists in database
            else {
                response.sendStatus(404);
            }
        }

        // No job in database
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.post("/edit", function(request, response, next) {
    /*  Edit a specific job
     *
     *  http://localhost:3000/jobs/edit
     *
     *  Returns
     *  -------
     *  json
     *      Job data
     */

    try {
        // Fetch jobs
        var jobs = [];
        if(fs.existsSync("data/jobs.json"))
            jobs = jsonfile.readFileSync("data/jobs.json");

        // Job data
        var post = request.body;

        var id = jobs.length + 1;

        // Alias for quick access
        // var job = jobs[id];

        // for(key in post) {
            // if(post[key] != undefined && post[key].length > 0)
                // job[key] = post[key];

            // else
                // delete job[key];
        // }

        // Write json content
        // jsonfile.writeFileSync("data/jobs.json", jobs, { spaces: 4 })

        response.sendStatus(200);
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

module.exports = router;
