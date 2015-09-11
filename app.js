var express = require('express'),
	bodyParser = require('body-parser'),
	q = require('q'),
	fs = require('fs'),
	request = require('request'),
	path = require('path'),
	famSearch = require('familysearch-javascript-sdk');

var ahnentafel = require('./custom_modules/ahnentafel');

var app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/public')));

app.post('/in', function (req, res) {

	var userId = req.body.userId;
	console.log('Requesting ancestors for:', userId);

	// Check if file exists
	var filename = './user_data/' + userId + '.json';
	fs.stat(filename, function (err, stats) {

		// If there's an error the file does not exists
		if (err) {
			console.log('File does not exist - requesting data');
			getData();

		} else {
			// If the file does exists simply send that back to the user
			console.log('File exists - sending data');
			res.send(fs.readFileSync(filename, 'utf8'));

		}
	})

	function getData() {
		// Create a new FamilySearch object (instance) in node
		var fsClient = new famSearch({
			// Hard coded client_id
			client_id: 'a02j0000007rShWAAU',
			environment: 'beta',
			// Access token is received from the fsClient
			access_token: req.body.accessToken,
			http_function: request,
			deferred_function: q.defer
		});

		// Query for the users ancestors
		fsClient.getAncestry(userId, {
			generations: 6,
			personDetails: true,
			marriageDetails: false
		}).then(function (ancestors) {

			// Get the user information for the user object
			fsClient.getCurrentUser().then(function (response) {

				// get the user data and set it to the user variable.
				var userData = response.getUser().data;

				// Create a new user object
				var user = {
					contactName: userData.contactName,
					helperAccessPin: userData.helperAccessPin,
					givenName: userData.givenName,
					familyName: userData.familyName,
					email: userData.email,
					country: userData.country,
					gender: userData.gender,
					birthDate: userData.birthDate,
					preferredLanguage: userData.preferredLanguage,
					displayName: userData.displayName,
					personId: userData.personId,
					treeuserId: userData.treeUserId,
					ancestors: ahnentafel(ancestors)
				};

				var filename = path.join(__dirname, 'user_data/', userId) + '.json';

				fs.writeFile(filename, JSON.stringify(user, null, 4), function (err) {
					if (err) {
						console.log(err);
						res.send("File could not be created.");
					} else {
						console.log('./user_data/' + userId + '.json - File successfully written');
						res.send(user);
					}
				})

			})
		});
	}
});

app.listen(8888);
