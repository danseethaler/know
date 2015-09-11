angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS) {

		$scope.login = function () {
			$scope.loggedin = true;

            initFS.login()
				.then(function (req, res) {
                    $scope.ancestors = req.data.ancestors;
                    loadTimeline(req.data.ancestors);
				});
		}

		$scope.logout = function(){
			initFS.logout();
		}
	})
