var fs          = require('fs');
var http        = require('http');
var moment      = require('moment');
var request     = require('request');
var express     = require('express');
var jsonfile    = require('jsonfile');
var jwt         = require('jwt-simple');

var config      = require('./config.js')

var router      = express.Router();

console.info(config)

/*
 *  Generate JSON Web Token
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };

    return jwt.encode(payload, config.secret_key);
}

/*
 *  Authentificate a LinkedIn user
 */
router.post("/linkedin", function(req, res) {
    console.info("Catch linkedin connection request");

    var apiParams = ":(id,firstName,lastName,headline,location,industry," +
        "summary,specialties,positions,picture-url,email-address," +
        "picture-urls::(original),num-connections,num-connections-capped," +
        "public-profile-url)"

    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        redirect_uri: req.body.redirectUri,
        client_secret: config.secret_key,
        grant_type: "authorization_code"
    }

    try {
        // Step 1 : Exchange authorization code for access token
        request.post(config.token_url, { form: params, json: true },
            function(err, response, body) {

            if(response.statusCode !== 200) {
                return res.sendStatus(response.statusCode);
            }

            var params = {
                oauth2_access_token: body.access_token,
                format: 'json'
            };

            // Step 2 : Retrieve profile information about the current user.
            request.get({ url: config.api_url + apiParams, qs: params, json: true },
                function(err, response, profile) {

                var id = profile.id;

                if(fs.existsSync("data/users.json")) {
                    var data = jsonfile.readFileSync("data/users.json");
                }
                else {
                    var data = [];
                }

                // Add an empty json structure when data is empty
                if(data.length == 0)
                    data.push({});

                // Register profile
                if(!(id in data[0]))
                    data[0][id] = profile;

                // Update profile
                else
                    data[0][id] = profile;

                jsonfile.writeFileSync("data/users.json", data, { spaces: 4 })

                // Step 3 : Generate a token from profile
                var token = createJWT(profile);

                res.json(JSON.stringify({ token: token, profile: profile }));
            });
        });
    }
    catch(error) {
        console.error(error);
        res.sendStatus(503);
    }
});

/*
 *  Register a new user
 */
router.post("/signup", function(request, response, next) {
    try {
        var data = jsonfile.readFileSync("data/users.json");

        var size = data.length;
        var post = request.body;

        var today = new Date();
        var day = today.getDate()
        var year = today.getFullYear()
        var month = today.getMonth()

        // Append a new user in json array
        data.push({
            id: size,
            register: year + "-" + month + "-" + day
        });

        for(key in post) {
            if(post[key] != undefined && post[key].length > 0) {
                data[size][key] = post[key];
            }
        }

        jsonfile.writeFileSync("data/users.json", data, { spaces: 4 })

        response.send({ id: size });
    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

/*
 *  Get user profile
 */

router.post("/profile", function(request, response, next) {
    try {

    }
    catch(error) {
        console.error(error);
        response.sendStatus(503);
    }
});

module.exports = router;
