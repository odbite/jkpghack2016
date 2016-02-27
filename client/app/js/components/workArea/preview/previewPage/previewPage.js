'use strict';

angular.module('navotron.previewPage', ['navotron.previewText'])

.directive('previewPage', function() {
    return {
        restrict: 'E',
        require: '^workArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewPage/previewPage.jade',
        scope: {
            nodes: '='
        },
        link: function(scope, elem, attrs, workAreaCtrl) {

            scope.setActiveNode = function(node) {
                scope.activeNode = node;
                workAreaCtrl.updateActiveNode(node);
            };

            scope.toggle = function(node) {
                node.active = !node.active;
            };

            scope.setParent = function(node) {
                scope.parentNode = node;
                scope.childNodes = node.children;
            };

            if ( scope.nodes.length > 0 ) {
                scope.setActiveNode(scope.nodes[0]);
                scope.setParent(scope.nodes[0]);
            }

        }
    };
});
