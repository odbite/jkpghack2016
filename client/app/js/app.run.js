'use strict';

angular.module('navotron.run', [
    'navotron.api',
    'navotron.constants',
    'navotron.notification',
])

.run(function($rootScope, $state, notification, api, AUTH_EVENTS) {

    // What happens after a user is logged in
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, args) {
        $state.go('root', {}, {reload: true});
    });

    // What happens after a user is logged out
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event, args) {
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if session is timed out
    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function(event, args) {
        api.users.logoutUser();
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if the user is not authrized to do a certain thing
    $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event, args) {
        notification.info('You do not have privilages to access that view.');
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if the user is not authenticated
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event, args) {
        api.users.logoutUser();
        $state.go('root.login');
    });
});
