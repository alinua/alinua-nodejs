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
    /*  Return the users list
     *
     *  http://localhost:3000/users/
     *
     *  Returns
     *  -------
     *  json
     *      Users list as json structure
     */

    try {
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Json structure
        var results = [];

        // Fetch users data and push them into results
        if(users.length > 0) {
            for(element in users[0]) {
                results.push(users[0][element]);
            }
        }

        response.json(results);
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/user/:id", function(request, response, next) {
    /*  Return a specific user profile
     *
     *  http://localhost:3000/users/user/<id>
     *
     *  Parameters
     *  ----------
     *  id : int
     *      User identifier
     *
     *  Returns
     *  -------
     *  json
     *      User data
     */

    try {
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Check users
        if(users.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];

            // User exists in database
            if(id in users[0]) {

                // Get inbox messages
                var inbox = [];
                if(fs.existsSync("data/inbox.json"))
                    inbox = jsonfile.readFileSync("data/inbox.json");

                // User has some messages
                if(id in inbox[0]) {
                    var unread = 0;

                    // Get unread messages count
                    for(message in inbox[0][id]) {
                        if(!inbox[0][id][message].status) {
                            unread += 1;
                        }
                    }

                    if(unread > 0)
                        users[0][id]["unread"] = unread;
                }

                // Send json structure
                response.json(JSON.stringify(users[0][id]));
            }

            // User not exists in database
            else {
                response.sendStatus(404);
            }
        }

        // No user in database
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/user/:id/status/:status", function(request, response, next) {
    /*  Change status for a specific user
     *
     *  http://localhost:3000/users/<id>/status/<status>
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
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Check users
        if(users.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];
            var status = (request.params["status"] == 'true');

            // Job exists in database
            if(id in users[0]) {
                users[0][id]["status"] = status;

                // Write json content
                jsonfile.writeFileSync("data/users.json", users, { spaces: 4 })

                response.sendStatus(200);
            }

            // Job not exists in database
            else {
                response.sendStatus(404);
            }
        }

        // No user in database
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
