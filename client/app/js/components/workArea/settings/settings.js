'use strict';

angular.module('navotron.workAreaSettings', [])

.controller('settingsController', function(formFactory, settingsFactory) {
    this.formFactory = formFactory;
    this.settingsFactory = settingsFactory;
    this.settingsFactory.getWorkarea();
})

.directive("workAreaSettings", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/settings/settingsView.jade',
    };
})

.service('formFactory', function() {
    var self = this;
    self.trySubmitted = false;

    self.fieldError = function(field) {
        return (field.$invalid && (!field.$pristine || self.trySubmitted));
    };

    self.fieldRequired = function(field) {
        return (field.$error.required && (!field.$pristine || self.trySubmitted));
    };

    self.fieldErrorOrRequired = function(field) {
        return (self.fieldError(field) || self.fieldRequired(field));
    };
})

.service('settingsFactory', function(session, api, notification, workAreaHelper) {
    var self = this;
    self.workArea = undefined;

    self.getWorkarea = function() {
        if ( self.showSettings() ) {
            api.workareas.getOne(session.activeWorkArea.hash_id)
            .then(function(workarea) {
                self.workArea = workarea;
            });
        }
    };

    self.showSettings = function() {
        return session.hasSetProperty('activeWorkArea');
    };

    self.saveWorkarea = function() {
        if ( self.workArea !== undefined ) {
            api.workareas.put(session.activeWorkArea.hash_id, self.workArea)
            .then(function(workarea) {
                self.workArea = workAreaHelper.setActiveWorkarea(workarea);
                notification.success('All changes saved');
            })

            .catch(function(reason) {
                notification.error('All changes saved', reason);
            });
        }
    };
});
