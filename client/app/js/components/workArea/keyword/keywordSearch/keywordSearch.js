'use strict';

angular.module('navotron.keywordSearch', [])

.directive('keywordSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/keyword/keywordSearch/keywordSearch.jade',
        scope: {
            activeWorkarea: '=',
        },
        link: function(scope) {
            scope.searchMonth = new Date();
        },
    };
});
