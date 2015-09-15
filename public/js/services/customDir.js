
// Directive is wrapped in an immediately invoked function expression
// to keep all variables outside of the global scope.
(function () {

    // This directive is tied to the app module by default
	angular.module('app')
        // The spinner attribute must be tied to the button that is retrieving data
		.directive('pending', function ($q) {

            // The link function is being setup as a variable to keep the code clean
			var link = function (scope, elem, attrs) {
				var spinner = angular.element('<div class="throbber-loader"> Loading… </div>').hide();
				elem.after(spinner);

				elem.click(function () {
					spinner.show();
					elem.hide();
					dataPromise()
						.then(function (data) {
							spinner.hide();
							elem.show();
						})
				});

				var dataPromise = function () {
					var deferred = $q.defer();
					scope.clicked()
						.then(function (data) {
							deferred.resolve(data)
						});
					return deferred.promise;
				}
			};

			return {
				restrict: 'A',
				scope: {
					clicked: '&'
				},
				link: link
			}
		});
}())
