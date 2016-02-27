'use strict';

angular.module('navotron.preview', [
    'navotron.previewPage',
    'navotron.previewHelp',
])

.directive('preview', function(api, session) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/preview/preview.jade',
        scope: {
            nodes: '='
        },
        controller: function($scope) {
            this.setHelpSection = function(helpSection) {
                $scope.helpSection = helpSection;
            };
        }
    };
});
