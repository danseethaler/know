angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS, $compile) {

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

					$scope.genNum = loadTimeline($scope.ancestors);

					$scope.setAvgAge();

					// This compile function takes the controls div
					// and compiles the appended pagination elements
					// into Angular so the ng-click functions fire
					// when clicked.
					$compile(document.getElementById('controls'))($scope);
				});
		}

		$scope.logout = function () {
			initFS.logout();
		}

		$scope.setGen = function(genNum){
			$scope.genNum = genNum;
			$scope.setAvgAge();
		}

		$scope.setAvgAge = function(){
			var sum = 0;
			var count = 0;

			for (var i = 0; i < $scope.ancestors.length; i++) {
				if ($scope.ancestors[i].yearsOfLife && $scope.ancestors[i].genNum === $scope.genNum) {
					sum += parseInt($scope.ancestors[i].yearsOfLife, 10);
					count++;
				}
			}
			if (count === 0) {
				$scope.avgAge = 'No data';
			}else {
				$scope.avgAge = Math.round(sum/count);
			}
		}

	})
