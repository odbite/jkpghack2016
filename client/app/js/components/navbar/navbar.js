'use strict';

angular.module('navotron.navbar', [
    'navotron.api',
])

.controller("navbarController", function($state, api) {
    this.users = api.users;
    this.includes = $state.includes;
})

.directive("navbar", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/navbar.jade',
    };
});
