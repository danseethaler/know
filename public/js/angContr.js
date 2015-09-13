angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS) {

		$scope.login = function () {
			$scope.loggedin = true;

            initFS.login()
				.then(function (req, res) {
					for (var prop in req.data) {
						if (req.data.hasOwnProperty(prop)) {
							$scope[prop] = req.data[prop];
						}
					}
                    loadTimeline(req.data.ancestors);
				});
		}

		$scope.logout = function(){
			initFS.logout();
		}
	})
