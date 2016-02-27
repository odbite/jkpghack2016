'use strict';

angular.module('navotron.controlPanel', ['navotron.workArea'])

.directive('controlPanel', function(workAreaEvent, session, workAreaHelper) {
    return {
        restrict: 'E',
        scope: {},
        link: function($scope) {
            $scope.editing = workAreaEvent.editing;
            $scope.workArea = session.activeWorkArea;

            $scope.patchWorkArea = function(workArea, newVal) {
                return workAreaHelper.patchWorkarea(workArea.hash_id, newVal)

                .then(function(workArea) {
                    workAreaHelper.setActiveWorkarea(workArea);
                });
            };
        },
        templateUrl: 'js/components/workArea/controlPanel/controlPanelView.jade',

    };
});
