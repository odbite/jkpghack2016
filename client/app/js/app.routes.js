'use strict';

angular.module('navotron.routes', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {

    // Default, if nothing matches go here.
    $urlRouterProvider.otherwise('/');

    $stateProvider

    .state('root', {
        url: '/',
        views: {
            '@' : { templateUrl: 'js/main.jade' },
            'header@root' : { template: '<navbar></navbar>' },
            'main@root' : { template: '<knowme></knowme>' },
            'footer@root' : { template: '' },
        }
    });

});
