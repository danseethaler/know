angular.module('app')
	.service('initFS', function ($location, $http, $q, $timeout) {

        this.login = function(){
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

            return fsClient.getCurrentUser().then(function(req, res){
        		return $http.post('/in', {
        			accessToken: fsClient.helpers.settings.accessToken,
                    userId: req.getUser().personId
        		})
            })
        }

	})
