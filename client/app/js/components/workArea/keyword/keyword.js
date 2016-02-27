'use strict';

angular.module('navotron.keywords', [
    'navotron.keywordList',
    'navotron.keywordSearch',
])

.directive('keyword', function(workAreaHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/keyword/keyword.jade',
        scope: {},
        link: function(scope, element, attr) {
            scope.activeWorkarea = workAreaHelper.getActiveWorkarea();
        },
    };
});
