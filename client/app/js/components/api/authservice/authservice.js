'use strict';

angular.module('navotron.authService', ['navotron.authOauth2'])

.factory('authService', function(oauth2, tokens) {

    return {
        logoutUser: function() {
            tokens.destroy();
            tokens.load();
        },

        loginUser: function(username, password) {
            return oauth2.login(username, password);
        },

        // -> Boolean
        // produce true if the user has session and is logged in
        isAuthenticated: function() {
            return !!tokens.accessToken;
        },
    };
});
