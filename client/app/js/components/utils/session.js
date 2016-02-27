'use strict';

angular.module('navotron.session', ['LocalStorageModule'])

.service('session', function(localStorageService) {
    this.load = function() {
        this.user = localStorageService.get('user');
        this.activeNode = localStorageService.get('activeNode');
        this.activeWorkArea = localStorageService.get('activeWorkArea');
    };

    this.set = function(name, value) {
        localStorageService.set(name, value);
        this.load();
    };

    this.destroy = function() {
        localStorageService.remove('user');
        this.activeNode = localStorageService.get('activeNode');
        localStorageService.remove('activeWorkArea');
    };

    this.hasSetProperty = function(key) {
        if ( localStorageService.get(key) === null ) {
            return false;
        }
        else {
            return true;
        }
    };

    this.load();
});
