var fs          = require('fs');
var express     = require('express');
var jsonfile    = require('jsonfile');

var router      = express.Router();

/*
 *  Get users listing
 */
router.get("/", function(request, response, next) {

    if(fs.existsSync("data/users.json")) {
        var data = jsonfile.readFileSync("data/users.json");
    }
    else {
        var data = [];
    }

    var results = [];

    if(data.length > 0) {
        for(user in data[0]) {
            results.push(data[0][user]);
        }
    }

    response.json(results);
});

/*
 *  Get a user with identifier <id>
 */
router.get("/user/:id", function(request, response, next) {

    if(fs.existsSync("data/users.json")) {
        var data = jsonfile.readFileSync("data/users.json");
    }
    else {
        var data = [];
    }

    var id = request.params["id"];

    if(data.length > 0) {
        if(id in data[0]) {
            response.json(JSON.stringify(data[0][id]));
        }
        else {
            response.sendStatus(404);
        }
    }
    else {
        response.sendStatus(503);
    }
});

/*
 *  Edit a user with identifier <id>
 */
router.post("/edit/:id", function(request, response, next) {
    try {
        var data = jsonfile.readFileSync("data/users.json");

        var post = request.body;

        var user = data[request.params["id"]];

        for(key in post) {
            if(post[key] != undefined && post[key].length > 0) {
                user[key] = post[key];
            }
            else {
                delete user[key];
            }
        }

        jsonfile.writeFileSync("data/users.json", data, { spaces: 4 })

        response.send(true);
    }
    catch(error) {
        response.sendStatus(503);
    }
});

module.exports = router;
