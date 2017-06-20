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

router.get("/:id", function(request, response, next) {
    /*  Return the user inbox messages list
     *
     *  http://localhost:3000/inbox/<id>
     *
     *  Returns
     *  -------
     *  json
     *      Jobs list as json structure
     */

    try {
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Json structure
        var results = [];

        // Check users
        if(users.length > 0) {

            // Get identifier from URL
            var id = request.params["id"];

            // User exists in database
            if(id in users[0]) {

                // Fetch messages
                var inbox = [];
                if(fs.existsSync("data/inbox.json"))
                    inbox = jsonfile.readFileSync("data/inbox.json");

                if(inbox.length > 0) {
                    for(message in inbox) {
                        if(inbox[message].owner == id) {
                            results.push(inbox[message]);
                        }
                    }
                }

                response.json(results);
            }

            // This user not exists
            else {
                response.sendStatus(404);
            }
        }

        // No users register in database
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/:u_id/:m_id", function(request, response, next) {
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
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Check users
        if(users.length > 0) {

            // Get user identifier from URL
            var u_id = request.params["u_id"];
            // Get message identifier from URL
            var m_id = parseInt(request.params["m_id"]);

            // User exists in database
            if(u_id in users[0]) {

                var results = undefined;

                // Fetch messages
                var inbox = [];
                if(fs.existsSync("data/inbox.json"))
                    inbox = jsonfile.readFileSync("data/inbox.json");

                if(inbox.length > 0) {
                    for(message in inbox) {
                        if(inbox[message].owner == u_id && inbox[message].id == m_id) {
                            results == inbox[message];
                            break;
                        }
                    }
                }

                if(results != undefined)
                    response.json(results);

                else
                    response.sendStatus(404);
            }

            // This user not exists
            else {
                response.sendStatus(404);
            }
        }

        // No users register in database
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.get("/status/:u_id/:m_id", function(request, response, next) {
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
        // Fetch users
        var users = [];
        if(fs.existsSync("data/users.json"))
            users = jsonfile.readFileSync("data/users.json");

        // Check users
        if(users.length > 0) {

            // Get user identifier from URL
            var u_id = request.params["u_id"];
            // Get message identifier from URL
            var m_id = request.params["m_id"];

            // Fetch messages
            var inbox = [];
            if(fs.existsSync("data/inbox.json"))
                inbox = jsonfile.readFileSync("data/inbox.json");

            // Check messages
            if(inbox.length > 0) {

                var results = undefined;

                for(message in inbox) {
                    if(inbox[message].owner == u_id && inbox[message].id == m_id) {
                        results = inbox[message];
                        break;
                    }
                }

                if(results != undefined) {
                    results.status = !results.status;

                    jsonfile.writeFileSync("data/inbox.json", inbox, { spaces: 4 })

                    response.json({ "status": results.status });
                }

                else
                    response.sendStatus(404);
            }

            // This user not exists
            else {
                response.sendStatus(404);
            }
        }

        // No message in database
        else {
            response.sendStatus(503);
        }
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

router.post("/delete", function(request, response, next) {
    /*  Remove a specific inbox
     *
     *  http://localhost:3000/messages/delete
     */

    try {
        // Fetch messages
        var messages = [];
        if(fs.existsSync("data/inbox.json"))
            messages = jsonfile.readFileSync("data/inbox.json");

        // Project identifier
        if("id" in request.body) {
            var id = request.body.id;

            var inbox = undefined;

            for(element in messages) {
                if(messages[element].id == id) {
                    inbox = element;
                    break
                }
            }

            if(inbox != undefined) {
                messages.splice(inbox, 1);

                // Write json content
                jsonfile.writeFileSync("data/inbox.json", messages, { spaces: 4 });

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
