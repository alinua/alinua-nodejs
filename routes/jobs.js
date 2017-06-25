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

        // Fetch jobs data and push them into results
        if(jobs.length > 0) {

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            // Replace user attribute in job with user data
            for(element in jobs) {
                var job = jobs[element];

                if("owner" in job)
                    job["owner"] = users[0][job["owner"]];
            }
        }

        response.json(jobs);
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
        var job = undefined;

        // Fetch jobs data and push them into results
        if(jobs.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];

            // Fetch users
            var users = [];
            if(fs.existsSync("data/users.json"))
                users = jsonfile.readFileSync("data/users.json");

            // Replace user attribute in job with user data
            for(element in jobs) {

                if(jobs[element].id == id) {
                    job = jobs[element];
                    break;
                }
            }

            // Replace user attribute in project with user data
            if(!(job == undefined)) {

                // Replace user attribute in job with user data
                if("owner" in job)
                    job["owner"] = users[0][job["owner"]];

                response.json(job);
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

        // Job identifier
        if("id" in request.body) {
            var id = request.body.id;
            var edit = true;
        }
        else {
            var id = 1;
            for(job in jobs) {
                if(jobs[job].id >= id)
                    id = jobs[job].id + 1;
            }
            var edit = false;
        }

        // Job data
        if(!edit) {
            console.info(request.body);
            jobs.push({
                "id": parseInt(id),
                "status": false,
                "owner": request.body.owner,
                "date": new Date().toLocaleString(),
                "title": request.body.title,
                "description": {
                    "content": request.body.description,
                    "tags": request.body.tags.split(" ")
                },
                "location": {
                    "name": request.body.city,
                    "country": request.body.country
                },
                "validity": new Date(
                    parseInt(request.body.year) + '-' +
                    parseInt(request.body.month) + '-' +
                    parseInt(request.body.day)).toLocaleString()
            });

            // Write json content
            jsonfile.writeFileSync("data/jobs.json", jobs, { spaces: 4 });

            response.json(JSON.stringify({
                job: parseInt(id) }));
        }
        else {
            var job = undefined;

            for(element in jobs) {
                if(jobs[element].id == id) {
                    job = jobs[element];
                    break
                }
            }

            if(job != undefined) {
                data = {
                    "id": parseInt(request.body.id),
                    "status": request.body.status,
                    "title": request.body.title,
                    "description": {
                        "content": request.body.description,
                        "tags": request.body.tags
                    },
                    "location": {
                        "name": request.body.city,
                        "country": request.body.country
                    },
                    "validity": new Date(
                        parseInt(request.body.year) + '-' +
                        parseInt(request.body.month) + '-' +
                        parseInt(request.body.day)).toLocaleString()
                };

                for(key in data) {
                    if(data[key] == undefined)
                        delete data[key];

                    if(key == "description" || key == "location") {
                        for(subkey in data[key]) {
                            if(data[key]["tags"] != undefined)
                                job[key]["tags"] = data[key]["tags"].split(" ");
                            else if(data[key][subkey] != undefined)
                                job[key][subkey] = data[key][subkey];
                        }
                    }
                    else if(key == "validity" && data[key] != "Invalid Date") {
                        job[key] = data[key];
                    }
                    else if(data[key] != undefined) {
                        job[key] = data[key];
                    }
                }

                // Write json content
                jsonfile.writeFileSync("data/jobs.json", jobs, { spaces: 4 });

                response.json(JSON.stringify({
                    job: parseInt(id) }));
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
    /*  Remove a specific job
     *
     *  http://localhost:3000/jobs/delete
     */

    try {
        // Fetch jobs
        var jobs = [];
        if(fs.existsSync("data/jobs.json"))
            jobs = jsonfile.readFileSync("data/jobs.json");

        // Project identifier
        if("id" in request.body) {
            var id = request.body.id;

            var job = undefined;

            for(element in jobs) {
                if(jobs[element].id == id) {
                    job = element;
                    break
                }
            }

            if(job != undefined) {
                jobs.splice(job, 1);

                // Write json content
                jsonfile.writeFileSync("data/jobs.json", jobs, { spaces: 4 });

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
