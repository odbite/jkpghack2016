'use strict';

angular.module('navotron.previewHelp', [])

.directive('helpText', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewHelp/previewHelp.jade',
        scope: {
            helpSection: '='
        },
    };
});
