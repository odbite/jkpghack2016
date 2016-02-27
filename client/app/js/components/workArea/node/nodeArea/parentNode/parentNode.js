'use strict';

angular.module('navotron.nodeParent', [])

.controller('nodeParentController', function(nodeTreeFactory) {
    this.nodeTreeFactory = nodeTreeFactory;
})

.directive('nodeParent', function(nodeHelper) {
    return {
        restrict: 'E',
        require: '^workArea',
        templateUrl: 'js/components/workArea/node/nodeArea/parentNode/parentNode.jade',
        scope: {
            node: '=',
            workArea: '=',
            addSubItem: '&',
        },
        link: function($scope, element, attr, workAreaCtrl) {

            $scope.setActiveNode = function(node) {
                nodeHelper.setActiveNode(node);
                workAreaCtrl.updateActiveNode();
            };

            $scope.patchNode = function(workArea, node, newVal) {
                return nodeHelper.patchNode(workArea.hash_id, node.id, newVal)

                .then(function(node) {
                    $scope.setActiveNode(node);
                });
            };

        }
    };
});
