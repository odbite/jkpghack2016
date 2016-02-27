'use strict';

angular.module('navotron.authOauth2', ['LocalStorageModule'])

.provider('oauth2', function() {
    var clientId, clientSecret, url;

    function params(obj) {
        var str = [];
        for(var p in obj) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
    }

    this.setClientDetails = function(config) {
        url = config.url;
        clientId = config.clientId;
        clientSecret = config.clientSecret;
    };

    this.$get = function($http, tokens) {

        function oauthLogin(data) {
            return $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: params(data),
            })
            .then(function(resp) {
                tokens.create(resp.data.access_token,
                              resp.data.refresh_token,
                              resp.data.expires_in);
                return resp;
            });
        }

        return {
            login: function(username, password) {
                return oauthLogin({
                    'grant_type': 'password',
                    'client_id': clientId,
                    'client_secret': clientSecret,
                    'username': username,
                    'password': password,
                });
            },
            refresh: function() {
                var refreshToken = tokens.refreshToken;
                tokens.destroy();

                return oauthLogin({
                    'grant_type': 'refresh_token',
                    'client_id': clientId,
                    'client_secret': clientSecret,
                    'refresh_token': refreshToken,
                });
            },
            refreshRequired: function() {
                if ( !tokens.accessToken ) {
                    return false;
                }

                return tokens.expiryDate <= Math.floor(Date.now() / 1000);
            }
        };
    };
})

.service('tokens', function(localStorageService) {
    this.load = function() {
        this.accessToken = localStorageService.get('accessToken');
        this.refreshToken = localStorageService.get('refreshToken');
        this.expiryDate = localStorageService.get('expiryDate');
    };

    this.create = function(access_token, refresh_token, expires_in) {
        var expiryDate = Math.floor(Date.now() / 1000) + expires_in;
        localStorageService.set('accessToken', access_token);
        localStorageService.set('refreshToken', refresh_token);
        localStorageService.set('expiryDate', expiryDate);
        this.load();
    };

    this.destroy = function() {
        localStorageService.remove('accessToken');
        localStorageService.remove('refreshToken');
        localStorageService.remove('expiryDate');
        this.load();
    };

    this.load();
})

.factory('tokenInterceptor', function($injector, tokens) {
    return {
        request: function(config) {

            if (tokens.accessToken !== null) {
                angular.extend(config.headers, {
                    'Authorization': 'Bearer ' + tokens.accessToken
                });
            }

            if (config.url !== '/oauth2/token/') {
                var oauth2 = $injector.get('oauth2');
                if (oauth2.refreshRequired()) {
                    return oauth2.refresh().then(function() {
                        return config;
                    });
                }
            }

            return config;
        }
    };
})

.config(function($httpProvider) {
    $httpProvider.interceptors.push('tokenInterceptor');
});
