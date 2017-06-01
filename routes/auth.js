/* --------------------------------------------------------------------------
 *  Modules
 * -------------------------------------------------------------------------- */

var fs          = require('fs');
var http        = require('http');
var moment      = require('moment');
var request     = require('request');
var express     = require('express');
var jsonfile    = require('jsonfile');
var jwt         = require('jwt-simple');

var config      = require('./config.js')

var router      = express.Router();

/* --------------------------------------------------------------------------
 *  Functions
 * -------------------------------------------------------------------------- */

function createJWT(user) {
    /*  Generate a JSON Web Token from user data
     *
     *  Parameters
     *  ----------
     *  user : json
     *      User data
     *
     *  Returns
     *  -------
     *  json
     *      User token
     */

    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };

    return jwt.encode(payload, config.secret_key);
}

/* --------------------------------------------------------------------------
 *  Routes
 * -------------------------------------------------------------------------- */

router.post("/linkedin", function(req, res) {
    /*  Authenticate user from a LinkedIn Account
     *
     *  http://localhost:3000/auth/linkedin/
     *
     *  Returns
     *  -------
     *  json
     *      Token structure
     */

    var apiParams = ":(id,firstName,lastName,headline,location,industry," +
        "summary,specialties,positions,picture-url,email-address," +
        "picture-urls::(original),num-connections,num-connections-capped," +
        "public-profile-url)";

    // Generate parameters for LinkedIn request
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        grant_type: "authorization_code",
        redirect_uri: req.body.redirectUri,
        client_secret: config.secret_key
    };

    try {
        // Step 1 : Exchange authorization code for access token
        request.post(config.token_url, { form: params, json: true },
            function(err, response, body) {

            // An error occurs
            if(response.statusCode !== 200) {
                return res.sendStatus(response.statusCode);
            }

            // Generate parameters from access token
            var params = {
                oauth2_access_token: body.access_token,
                format: 'json'
            };

            // Step 2 : Retrieve profile information about the current user.
            request.get({ url: config.api_url + apiParams, qs: params, json: true },
                function(err, response, profile) {

                var id = profile.id;

                // Fetch users
                var users = [];
                if(fs.existsSync("data/users.json"))
                    users = jsonfile.readFileSync("data/users.json");

                // Add an empty json structure when data is empty
                if(users.length == 0)
                    users.push({});

                // Register profile
                // if(!(id in users[0]))
                    // users[0]["profile"] = profile;

                // Update user profile
                users[0][id]["profile"] = profile;

                // Write json content
                jsonfile.writeFileSync("data/users.json", users, { spaces: 4 })

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

module.exports = router;
