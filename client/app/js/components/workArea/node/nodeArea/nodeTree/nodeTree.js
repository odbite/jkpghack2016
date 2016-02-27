'use strict';

angular.module('navotron.nodeTree', [
    'navotron.api',
    'navotron.modifyField',
    'navotron.nodeHelper',
    'navotron.workArea',
    'ui.tree',
])

.controller('nodeTreeController', function(nodeHelper, nodeTreeFactory, nodeTreeEvent) {
    this.nodeHelper = nodeHelper;
    this.nodeTreeFactory = nodeTreeFactory;
    this.nodeTreeEvent = nodeTreeEvent;
})

.directive('nodeTree', function(nodeHelper, nodeTreeEvent) {
    return {
        restrict: 'E',
        transclude: true,
        require: ['^nodeArea', '^workArea'],
        templateUrl: 'js/components/workArea/node/nodeArea/nodeTree/nodeTreeView.jade',
        scope: {
            nodes: '=',
            workArea: '=',
        },
        link: function($scope, element, attr, controllers) {
            var nodeAreaCtrl = controllers[0];
            var workAreaCtrl = controllers[1];

            // Node -> Boolean
            // produce true if the node is active
            $scope.setActiveNode = function(node) {
                workAreaCtrl.updateActiveNode(node);
            };

            $scope.patchNode = function(workArea, node, newVal) {
                return nodeHelper.patchNode(workArea.hash_id, node.id, newVal)

                .then(function(node) {
                    $scope.setActiveNode(node);
                });
            };

            // Node -> Boolean
            // hide a node in the nodetree and then remove it from the database
            $scope.deleteNode = function(nodeScope, node) {
                $scope.setActiveNode(false);
                nodeHelper.deleteNodeFromDatabase(nodeScope, nodeHelper.hideNode(node));
            };

            $scope.treeOptions = {

                // Event ->
                // on move event, lock node then save to database
                dropped: function(event) {

                    // If parentnode has changed or position index then update position
                    if ( nodeHelper.changedPosition(event.source, event.dest) ) {

                        // Set constants
                        var sourceNode = event.source.nodeScope.node;
                        var destNodes = event.dest.nodesScope.$modelValue;
                        var destParentNode = nodeHelper.getParentNode(event.dest.nodesScope.node);

                        if ( destParentNode === null ) {
                            nodeAreaCtrl.updateIndexes();
                        }
                        else {
                            // Update the destination nodes indexes
                            nodeHelper.updateIndexes($scope.workArea.hash_id,
                                                     nodeHelper.getMovingNodes(destNodes, destParentNode),
                                                     sourceNode,
                                                     destNodes);
                        }
                    }
                },

                accept: function(sourceNodeScope, destNodesScope, destIndex) {
                    return (destNodesScope.depth() > 0 || destNodesScope.nodes.length <= 0 );
                },

                dragStart: function() {
                    nodeTreeEvent.start();
                },

                dragStop: function() {
                    nodeTreeEvent.stop();
                },

                dragMove: function(e) {
                    var placeholder = angular.element(e.dest.nodesScope.$element[0].getElementsByClassName('angular-ui-tree-placeholder'));
                    placeholder.html('Move page(s) here.');
                },
            };

        },

    };

})

.service('nodeTreeFactory', function(nodeTreeEvent, nodeHelper, workAreaEvent, api, notification) {

    // Node -> Boolean
    // produce true if the node has children
    this.haveChildren = function(node) {
        return (node.children.length > 0);
    };

    // Boolean Node ->
    // set if show editing buttons for node or not
    this.showEditButtons = function(show, node) {
        if ( !nodeTreeEvent.editing() || !show ) {
            node.showEditButtons = show;
        }
    };

    // Integer String (listof Node) -> Promise
    // produce a new node in the nodetree and save it to the database
    this.addSubNode = function(id, name, lon, workAreaId) {

        // Set parameters
        var node = {
            'name': name + '.' + (lon.length + 1),
            'parentNode': id,
            'lock': true,
            'index': lon.length,
            'workarea': workAreaId
        };

        // Create new node under parent
        var newNode = nodeHelper.newNode(node);

        // Add newNode to the end of the list
        lon.push(newNode);

        // Add node to database
        return workAreaEvent.wrap(api.nodes.post(workAreaId, newNode))

        .then(function(node) {
            lon[lon.length - 1] = node;
            return node;
        })

        .catch(function(reason) {
            lon.splice(lon.length - 1, 1);
            notification.error('Could not create node', reason);
            return reason;
        });
    };

});
