angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS) {

		$scope.login = function (refresh) {
			$scope.loggedin = true;

			initFS.login(refresh)
				.then(function (req, res) {
					for (var prop in req.data) {
						if (req.data.hasOwnProperty(prop)) {
							$scope[prop] = req.data[prop];
						}
					}

					var myNode = document.querySelector(".chart");
					while (myNode.firstChild) {
						myNode.removeChild(myNode.firstChild);
					}

					loadTimeline(req.data.ancestors);
				});
		}

		$scope.logout = function () {
			initFS.logout();
		}

	})
