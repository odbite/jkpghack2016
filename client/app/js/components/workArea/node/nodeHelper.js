'use strict';

angular.module('navotron.nodeHelper', [
    'navotron.workArea',
    'navotron.api',
    'navotron.notification',
])

.factory('nodeTreeEvent', function($rootScope) {
    var editing = false;

    $rootScope.$on('nodetree.edit.start', function() {
        editing = true;
    });

    $rootScope.$on('nodetree.edit.stop', function() {
        editing = false;
    });

    return {
        start: function() {
            $rootScope.$emit('nodetree.edit.start');
        },

        stop: function() {
            $rootScope.$emit('nodetree.edit.stop');
        },

        wrap: function(promise) {
            $rootScope.$emit('nodetree.edit.start');
            promise.finally(function() {
                $rootScope.$emit('nodetree.edit.stop');
            });
            return promise;
        },

        editing: function() {
            return editing;
        }
    };
})

.service('nodeHelper', function(api, notification, workAreaEvent, nodeTreeEvent, session) {

    // -> Workarea
    // get the active workarea
    this.getActiveNode = function() {
        session.load();
        return session.activeNode;
    };

    // Workarea -> Workarea
    // set active workarea and return it
    this.setActiveNode = function(activeNode) {
        session.set('activeNode', activeNode);
        return activeNode;
    };

    // Node -> Node
    // produce a node with the attribute hidden set to true
    this.hideNode = function(node) {
        node.hidden = true;
        return node;
    };

    // String Integer Node -> Promise
    // delete a node and either remove it or show it again
    this.deleteNodeFromDatabase = function(nodeScope, node) {

        // Delete node
        workAreaEvent.wrap(api.nodes.delete(node.workarea, node.id))

        .then(function(result) {
            nodeScope.remove();
            return true;
        })

        .catch(function(reason) {
            notification.error('Could not remove node', reason);
            node.hidden = false;
            return false;
        });
    };

    // String Integer Boolean listof(Keyword) listof(Node) -> Node
    // produce a node for the nodetree
    this.newNode = function(node) {
        return {
            name: node.name,
            parentNode: typeof node.parentNode !== 'undefined' ? node.parentNode : null,
            children: typeof node.children !== 'undefined' ? node.children : [],
            keywords: typeof node.keywords !== 'undefined' ? node.keywords : [],
            lock: typeof node.lock !== 'undefined' ? node.lock : false,
            index: typeof node.index !== 'undefined' ? node.index : 0,
            workarea: typeof node.workarea !== 'undefined' ? node.workarea : null,
        };
    };

    // Source Dest -> Boolean
    // produce true if parentnode has changed or position index then update position
    this.changedPosition = function(source, dest) {
        return (source.nodesScope.$id !== dest.nodesScope.$id) || (source.index !== dest.index);
    };

    // Node -> Integer or Null
    // produce the id value of a parent node
    this.getParentNode = function(node) {
        if (node === undefined) {
            return null;
        }
        else {
            return node.id;
        }
    };

    // (listof Node) (Integer or Null) -> (listof Node)
    // produce a list of nodes, with new updated indexes.
    this.getMovingNodes = function(destNodes, destParentNode) {
        var nodes = [];
        var index = 1;

        angular.forEach(destNodes, function(node) {

            this.push({
                'id': node.id,
                'index': index,
                'parentNode': destParentNode
            });

            index += 1;

        }, nodes);

        return nodes;
    };

    // (listof Node) Boolean -> (listof NodeScope)
    // produce a list of nodes with updated lock attribute
    this.lockNode = function(nodes, lock) {
        angular.forEach(nodes, function(node) {
            node.lock = lock;
        });

        return nodes;
    };

    // String (listof Node) Node (listof NodeScope)  ->
    // lock the nodes and then update the
    this.updateIndexes = function(workAreaId, nodes, sourceNode, destNodes) {

        // Lock node before change
        var lockNode = this.lockNode;
        lockNode(destNodes, true);

        // Update the node
        workAreaEvent.wrap(api.nodes.patchBulk(workAreaId, nodes))

        // Unlock the node and set the new parent for the node
        .then(function(nodes) {
            lockNode(destNodes, false);
            sourceNode.parentNode = nodes.parentNode;
        })

        .catch(function(reason) {
            lockNode(destNodes, false);
            notification.error('Could not move workarea', reason);
        });
    };

    // String Integer NodeParams -> Promise
    // produce the update the given nodes name or go back to the old one
    this.patchNode = function(workAreaId, nodeId, params) {
        return workAreaEvent.wrap(api.nodes.patch(workAreaId, nodeId, params))

        .then(function(nodes) {
            return nodes;
        })

        .catch(function(reason) {
            notification.error('Could not update the node.', reason);
            return reason;
        });
    };

    // Node -> Integer
    // produce the sum of all keywords in a node
    this.sumSearchVolume = function(node) {
        var sum = 0;

        if (node) {
            var keywords = node.keywords;

            angular.forEach(keywords, function(object) {
                sum += object.volume;
            });
        }

        return sum;
    };

});
