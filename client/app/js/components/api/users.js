'use strict';

angular.module('navotron.apiUsers', [
    'navotron.authService',
    'navotron.constants',
    'navotron.session',
])

.factory('users', function($http, $rootScope, authService, session, AUTH_EVENTS) {
    return {
        // String -> User
        // produce a user object with groups and username
        getCurrentUser: function() {
            return $http.get(Urls.user_current_user())
            .then(function(result) {
                return result.data;
            });
        },

        loginUser: function(username, password) {
            var self = this;

            authService.loginUser(username, password).then(function(result) {
                self.getCurrentUser().then(function(user) {
                    session.set('user', user);
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                });
            });
        },

        logoutUser: function() {
            authService.logoutUser();
            session.destroy();
            session.load();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },

        getUsername: function() {
            if ( session.user !== null ) {
                return session.user.username;
            }

            return undefined;
        },

        getUserGroup: function() {
            if ( session.user !== null ) {
                return session.user.groups[0];
            }

            return undefined;
        },

        isAuthorized: function(authorizedRoles) {
            if (authorizedRoles.length < 1) {
                return true;
            }

            return (authorizedRoles.indexOf(this.getUserGroup()) !== -1);
        },

        isAuthenticated: authService.isAuthenticated,
    };
});
