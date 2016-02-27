'use strict';

angular.module('navotron.resolver', [])

.factory('workAreaResolver', function($state, workAreaHelper, nodeHelper, api) {

    var currentWorkArea = function(workAreaId) {
        if ( workAreaId !== "" ) {
            return api.workareas.getOne(workAreaId)
            .then(function(workarea) {
                workAreaHelper.setActiveWorkarea(workarea);
                return workarea;
            });
        }
        else {
            return workAreaHelper.createWorkarea('http://www.new-workarea.se')

            .then(function(workArea) {
                api.nodes.post(workArea.hash_id, nodeHelper.newNode({ name: 'Home', workarea: workArea.hash_id }))

                .then(function(node) {
                    $state.go('root.workArea.navigation', {
                        workAreaId: workArea.hash_id
                    });

                    return workArea;
                });

            });
        }
    };

    return currentWorkArea;
})

.factory('nodeResolver', function($stateParams, api) {

    var currentNodes = function(workAreaId) {
        if ( workAreaId !== "" ) {
            return api.nodes.getNested(workAreaId);
        }

        return [];
    };

    return currentNodes;
});
