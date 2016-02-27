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
            'main@root' : { template: '<work-area-list></work-area-list>' },
            'footer@root' : { template: '' },
        },
        data: {
            authorizedRoles: [USER_ROLES.editor]
        },
    })

    .state('root.workAreaSettings', {
        url: 'settings',
        views: {
            'main@root' : { template: '<work-area-settings></work-area-settings>' },
        },
    })
    .state('root.login', {
        url: 'login',
        views: {
            'main@root' : { template: '<login username="currentUser" is-authenticated="isAuthenticated"></login>' },
        },
        data: {
            authorizedRoles: []
        },
    })
    .state('root.settings', {
        url: 'user/settings',
        views: {
            'main@root' : { template: '<settings></settings>' },
        },
    })
    .state('root.credits', {
        url: 'credits',
        views: {
            'main@root' : { template: '<credits></credits>' },
        },
    })

    .state('root.workArea', {
        url: 'workarea/:workAreaId',
        views: {
            'main@root' : { template: '<work-area></work-area>' },
        },
        resolve: {
            currentWorkArea: function(workAreaResolver, $stateParams) {
                return workAreaResolver($stateParams.workAreaId);
            },
            currentNodes: function(nodeResolver, $stateParams) {
                return nodeResolver($stateParams.workAreaId);
            },
        },
        abstract: true,
    })
    .state('root.workArea.navigation', {
        url: '/',
        views: {
            '@root.workArea' : {
                template: '<node-area nodes="nodes" work-area="workArea"></node-area>',
                controller: function($scope, currentWorkArea, currentNodes) {
                    $scope.workArea = currentWorkArea;
                    $scope.nodes = currentNodes;
                },
            },
        },
    })
    .state('root.workArea.preview', {
        url: '/preview',
        views: {
            '@root.workArea' : {
                template: '<preview nodes="nodes"></preview>',
                controller: function($scope, currentWorkArea, currentNodes) {
                    $scope.workArea = currentWorkArea;
                    $scope.nodes = currentNodes;
                },
            },
        },
    })
    .state('root.workArea.keywords', {
        url: '/keywords',
        views: {
            '@root.workArea' : {
                template: '<keyword></keyword>',
            },
        },
    });

});
