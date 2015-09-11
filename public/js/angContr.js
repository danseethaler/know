angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS) {

		$scope.login = function () {
            initFS.login()
				.then(function (req, res) {
                    $scope.ancestors = req.data;
                    loadTimeline(req.data);
				});
		}
	})
