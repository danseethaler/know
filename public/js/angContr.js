angular.module('app', [])
	.controller('mainContrl', function ($scope, $http, initFS, $compile) {

		$scope.login = function (refresh) {
			$scope.loggedin = true;

			$scope.loading = true;

			initFS.login(refresh)
				.then(function (req, res) {

					if (req === 'unauthorized') {
						initFS.logout();
						return;
					}

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

					$scope.calcDyk();

					$scope.loading = false;

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

		$scope.setGen = function (genNum) {
			$scope.genNum = genNum;
			$scope.calcDyk();
		}

		$scope.calcDyk = function () {

			var oldest = {yearsOfLife: 0};
			var youngest = {yearsOfLife: 150};

			for (var i = 0; i < $scope.ancestors.length; i++) {
				if ($scope.ancestors[i].yearsOfLife) {
					if ($scope.ancestors[i].yearsOfLife > oldest.yearsOfLife) {
						oldest = $scope.ancestors[i];
					}
					if ($scope.ancestors[i].yearsOfLife < youngest.yearsOfLife) {
						youngest = $scope.ancestors[i];
					}
				}
			}

			$scope.dyk = {
				oldest: oldest,
				youngest: youngest
			}

			oldest = {yearsOfLife: 0};
			youngest = {yearsOfLife: 150};

			for (var i = 0; i < $scope.ancestors.length; i++) {
				if ($scope.ancestors[i].yearsOfLife && $scope.ancestors[i].genNum === $scope.genNum) {
					if ($scope.ancestors[i].yearsOfLife > oldest.yearsOfLife) {
						oldest = $scope.ancestors[i];
					}
					if ($scope.ancestors[i].yearsOfLife < youngest.yearsOfLife) {
						youngest = $scope.ancestors[i];
					}
				}
			}

			$scope.dyk.gen = {};

			if (oldest.yearsOfLife !== 0) {
				$scope.dyk.gen.oldest = oldest;
			}else {
				$scope.dyk.gen.oldest = {yearsOfLife: 'Living'};
			}

			if (youngest.yearsOfLife !== 150) {
				$scope.dyk.gen.youngest = youngest;
			}else {
				$scope.dyk.gen.youngest = {yearsOfLife: 'Living'};
			}

			var sum = 0;
			var count = 0;
			var genSum = 0;
			var genCount = 0;

			for (var i = 0; i < $scope.ancestors.length; i++) {
				if ($scope.ancestors[i].yearsOfLife && $scope.ancestors[i].genNum === $scope.genNum) {
					genSum += parseInt($scope.ancestors[i].yearsOfLife, 10);
					genCount++;
				}
				if ($scope.ancestors[i].yearsOfLife) {
					sum += parseInt($scope.ancestors[i].yearsOfLife, 10);
					count++;
				}
			}

			if (genCount === 0) {
				delete $scope.dyk.gen.avgAge;
			} else {
				$scope.dyk.gen.avgAge = Math.round(genSum / genCount);
			}

			if (count === 0) {
				delete $scope.dyk.avgAge;
			} else {
				$scope.dyk.avgAge = Math.round(sum / count);
			}
		}
	})
