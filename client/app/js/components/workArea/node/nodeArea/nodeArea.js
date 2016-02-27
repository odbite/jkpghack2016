'use strict';

angular.module('navotron.nodeArea', [
    'navotron.nodeTree',
    'navotron.nodeParent',
])

.controller('nodeAreaController', function($scope, nodeAreaFactory) {
    this.nodeAreaFactory = nodeAreaFactory;
})

.directive('nodeArea', function(nodeAreaFactory, nodeHelper, api, session) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/node/nodeArea/nodeArea.jade',
        scope: {
            nodes: '=',
            workArea: '=',
        },
        controller: function($scope) {
            this.updateIndexes = function() {
                nodeAreaFactory.updateIndexes($scope.workArea.hash_id, $scope.subNodes);
            };
        },
        link: function($scope) {
            $scope.nodeParent = $scope.nodes.slice(0, 1)[0];
            $scope.subNodes = nodeAreaFactory.splitNodes($scope.nodes.slice(1, $scope.nodes.length));

            $scope.$watch('subNodes', function(newValue, oldValue) {
                $scope.subNodes = nodeAreaFactory.addEmptyNodeLists(newValue);
            }, true);
        }
    };
})

.service('nodeAreaFactory', function(api, workAreaEvent, nodeHelper) {

    // (listof Nodes) -> (listof (listof Nodes))
    // split up the diffrent nodes into sub trees
    this.splitNodes = function(nodes) {
        var result = [];
        var subNodes = [];

        angular.forEach(nodes, function(item) {
            subNodes[item.id] = [item];
            this.push(subNodes[item.id]);
        }, result);

        return result;
    };

    // (listof (listof Nodes)) -> (listof Nodes)
    // produce a flatten list of nodes
    this.collapseNodes = function(subNodes) {
        var result = [];

        angular.forEach(subNodes, function(item) {
            result.push.apply(result, item);
        });

        return result;
    };

    // (listof (listof Nodes)) -> (listof (listof Nodes))
    // produce a node list with empty nodelists
    this.addEmptyNodeLists = function(nodes) {
        var subNodes = [];

        angular.forEach(nodes, function(item) {
            if ( item.length > 0 ) {
                this.push([]);
                this.push(item);
            }
        }, subNodes);

        subNodes.push([]);

        return subNodes;
    };

    // String (listof (listof Nodes)) (listof Nodes) Integer ->
    // add a new node to the top of the nodetree
    this.addNewTopNode = function(workAreaId, subNodes, index) {
        var self = this;
        var newIndex = typeof index !== 'undefined' ? index + 1 : subNodes.length;

        // Set parameters
        var node = {
            'name': 'New page',
            'parentNode': null,
            'lock': true,
            'index': newIndex,
            'workarea': workAreaId,
        };

        // Create new node under parent
        var newNode = nodeHelper.newNode(node);

        // Add node to database
        workAreaEvent.wrap(api.nodes.post(workAreaId, newNode))

        .then(function(savedNode) {
            subNodes.splice(newIndex, 0, [savedNode]);
            self.updateIndexes(workAreaId, subNodes);
        });
    };

    this.updateIndexes = function(workAreaId, subNodes) {
        var i = 1;
        var nodes = [];

        angular.forEach(this.collapseNodes(subNodes), function(node) {
            node.index = i;
            i += 1;
            this.push(node);
        }, nodes);

        var newNodes = nodeHelper.getMovingNodes(nodes, null);

        workAreaEvent.wrap(api.nodes.patchBulk(workAreaId, newNodes));
    };

});
