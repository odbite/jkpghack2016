'use strict';

angular.module('navotron.notification', [])

.directive('ntNotification', function(notification) {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: 'js/components/utils/notification/notification.jade',
        link: function(scope, element, attrs) {
            scope.messages = notification.messages;
        }
    };
})

.provider('notification', function() {
    var messages = [];
    var timeout = 5000;

    this.setTimeout = function(time) {
        timeout = time;
    };

    this.$get = function($timeout) {
        function addMessage(msg, alertClass) {
            messages.push({
                message: msg,
                alertClass: alertClass,
            });

            $timeout(function() {
                messages.shift();
            }, timeout);
        }
        return {
            info: function(msg) {
                addMessage(msg, 'alert-info');
            },
            success: function(msg) {
                addMessage(msg, 'alert-success');
            },
            error: function(msg, reason) {
                addMessage(msg +
                           ' Status: ' + reason.status +
                           ' ErrorMsg: ' + reason.statusText, 'alert-danger');
            },
            messages: messages,
        };
    };
});
