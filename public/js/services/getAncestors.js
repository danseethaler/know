angular.module('app')
	.service('initFS', function ($location, $http, $q, $timeout) {

		var fsClient = new FamilySearch({
			client_id: 'a02j0000007rShWAAU',
			environment: 'beta',
			redirect_uri: location.href,
			http_function: $http,
			deferred_function: $q.defer,
			timeout_function: $timeout,
			save_access_token: true,
			auto_expire: true,
			auto_signin: true
		});

        this.login = function(refresh){

			if (docCookies.getItem('userId')) {
				// Return the promise from the http request to the node server
				return $http.post('/in', {
        			accessToken: fsClient.helpers.settings.accessToken,
                    userId: docCookies.getItem('userId'),
					refresh: refresh
        		})

			}else {
	            return fsClient.getCurrentUser().then(function(req, res){

					// Set a cookie for the active user ID
					docCookies.setItem('userId', req.getUser().personId);

					// Return the promise from the http request to the node server
	        		return $http.post('/in', {
	        			accessToken: fsClient.helpers.settings.accessToken,
	                    userId: req.getUser().personId
	        		})
	            })
			}
        }

		this.logout = function(){
			fsClient.invalidateAccessToken();

			// Remove cookies
			docCookies.removeItem('userId');
			var cookieKeys = docCookies.keys();
			for (var i = 0; i < cookieKeys.length; i++) {
				if (cookieKeys[i].substr(0, 9) === 'FS_ACCESS') {
					docCookies.removeItem(cookieKeys[i]);
				}
			}

			// Refresh the page
			location.href = location.origin;
		}

	})
