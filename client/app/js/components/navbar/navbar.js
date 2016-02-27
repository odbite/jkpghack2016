'use strict';

angular.module('navotron.navbar', [
    'navotron.api',
    'navotron.controlBox',
    'navotron.credits'
])

.controller("navbarController", function($state, api, workAreaHelper, creditFactory) {
    this.users = api.users;
    this.includes = $state.includes;
    this.workAreaHelper = workAreaHelper;
    this.creditFactory = creditFactory;

    this.creditFactory.updateUnits();
})

.directive("navbar", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/navbar.jade',
    };
});
