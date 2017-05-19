var express     = require('express');
var jsonfile    = require('jsonfile');

var router      = express.Router();

/*
 *  Get jobs listing
 */
router.get("/", function(request, response, next) {
    var data = jsonfile.readFileSync("data/jobs.json");

    response.json(JSON.stringify(data));
});

/*
 *  Get a job with identifier <id>
 */
router.get("/job/:id", function(request, response, next) {
    var data = jsonfile.readFileSync("data/jobs.json");

    response.json(JSON.stringify(data[request.params["id"]]));
});

/*
 *  Edit a job with identifier <id>
 */
router.post("/job/:id/edit", function(request, response, next) {
    try {
        var data = jsonfile.readFileSync("data/jobs.json");

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

        jsonfile.writeFileSync("data/jobs.json", data, { spaces: 4 })

        response.send(true);
    }
    catch(error) {
        response.sendStatus(503);
    }
});

module.exports = router;
