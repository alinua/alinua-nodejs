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

router.get("/user/:id", function(request, response, next) {
    /*  Return the user inbox messages list
     *
     *  http://localhost:3000/inbox/user/<id>
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

                // No message in inbox
                if(inbox.length == 0 || !(id in inbox[0])) {
                    response.json({});
                }

                // Send user messages
                else {

                    // Fetch jobs
                    var jobs = [];
                    if(fs.existsSync("data/jobs.json"))
                        var jobs = jsonfile.readFileSync("data/jobs.json");

                    // Fetch each message for user
                    for(message_id in inbox[0][id]) {

                        // Get message content
                        var message = inbox[0][id][message_id]

                        // Fetch job content
                        if(message.type == "job") {
                            if(message.data.id in jobs[0]) {
                                message.data = jobs[0][message.data.id];
                            }
                        }

                        if(message.user in users[0]) {
                            message.user = users[0][message.user];
                        }

                        results.push(message);
                    }

                    response.json(results);
                }
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

router.get("/user/:u_id/:m_id", function(request, response, next) {
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
        // Fetch messages
        var inbox = [];
        if(fs.existsSync("data/inbox.json"))
            inbox = jsonfile.readFileSync("data/inbox.json");

        // Check messages
        if(inbox.length > 0) {

            // Get user identifier from URL
            var u_id = request.params["u_id"];
            // Get message identifier from URL
            var m_id = request.params["m_id"];

            // User or message exists in database
            if(u_id in inbox[0] && m_id in inbox[0][u_id]) {
                response.json(inbox[0][u_id][m_id]);
            }

            // User or message not exists in database
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

router.get("/user/:u_id/:m_id/status", function(request, response, next) {
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
        // Fetch messages
        var inbox = [];
        if(fs.existsSync("data/inbox.json"))
            inbox = jsonfile.readFileSync("data/inbox.json");

        // Check messages
        if(inbox.length > 0) {

            // Get user identifier from URL
            var u_id = request.params["u_id"];
            // Get message identifier from URL
            var m_id = request.params["m_id"];

            // User or message exists in database
            if(u_id in inbox[0] && m_id in inbox[0][u_id]) {
                inbox[0][u_id][m_id].status = !inbox[0][u_id][m_id].status;

                jsonfile.writeFileSync("data/inbox.json", inbox, { spaces: 4 })

                response.json({ "status": inbox[0][u_id][m_id].status });
            }

            // User or message not exists in database
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

module.exports = router;
