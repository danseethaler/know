angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS) {

		var fsClient = initFS.login();

        fsClient.getCurrentUser().then(function(req, res){
    		$http.post('/in', {
    			accessToken: fsClient.settings.accessToken,
                userId: req.getUser().personId
    		}).then(function (req, res) {
    			console.log(req, res);
    		})
        })
	})
