'use strict';

angular.module('navotron.workArea', [
    'navotron.api',
    'navotron.controlPanel',
    'navotron.keywords',
    'navotron.nodeArea',
    'navotron.preview',
    'navotron.showNode',
])

.directive('workArea', function(nodeHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/workAreaView.jade',
        scope: {},
        controller: function($scope, $state) {
            $scope.state = $state;

            this.updateActiveNode = function(node) {
                nodeHelper.setActiveNode(node);
                $scope.activeNode = node;
            };
        }
    };
})

.factory('workAreaEvent', function($rootScope) {
    var editing = false;

    $rootScope.$on('nodetree.http.start', function() {
        editing = true;
    });

    $rootScope.$on('nodetree.http.stop', function() {
        editing = false;
    });

    return {
        wrap: function(promise) {
            $rootScope.$emit('nodetree.http.start');
            promise.finally(function() {
                $rootScope.$emit('nodetree.http.stop');
            });
            return promise;
        },

        editing: function() {
            return editing;
        }
    };
})

.service('workAreaHelper', function($timeout, session, api, workAreaEvent, notification) {

    // WorkareaParams -> Workarea
    // produce a workarea
    this.newWorkArea = function(params) {
        return {
            site_url: params.siteUrl,
            owner: typeof params.owner !== 'undefined' ? params.owner : null,
            nodes: typeof params.nodes !== 'undefined' ? params.nodes : [],
            keywords: typeof params.keywords !== 'undefined' ? params.keywords : [],
        };
    };

    // String String -> Promise
    // produce a new workarea and then reload the current view with it.
    this.createWorkarea = function(siteUrl) {

        var newWorkArea = this.newWorkArea({
            siteUrl: siteUrl,
            owner: session.user.id,
        });

        // Load or create workarea
        return workAreaEvent.wrap(api.workareas.post(newWorkArea))

        .catch(function(reason) {
            notification.error('Could not create workarea', reason);
        });
    };

    // String WorkAreaParams -> Promise
    // produce the update the given workarea
    this.patchWorkarea = function(workAreaId, params) {
        return workAreaEvent.wrap(api.workareas.patch(workAreaId, params))

        .catch(function(reason) {
            notification.error('Could not update the workarea.', reason);
            return reason;
        });
    };

    // Workarea Integer -> Promise
    // produce a promise with a comfirmation that the workarea was removed
    this.delete = function(workarea, index) {
        var self = this;

        $timeout(function() {
            workarea.deleting = true;
        }, 500);

        return api.workareas.delete(workarea.hash_id)
        .then(function(result) {
            if (workarea.hash_id === self.getActiveWorkarea().hash_id) {
                self.setActiveWorkarea(undefined);
            }

            return result;
        });
    };

    // -> Workarea
    // get the active workarea
    this.getActiveWorkarea = function() {
        session.load();
        return session.activeWorkArea;
    };

    // Workarea -> Workarea
    // set active workarea and return it
    this.setActiveWorkarea = function(activeWorkArea) {
        session.set('activeWorkArea', activeWorkArea);
        return activeWorkArea;
    };

});
