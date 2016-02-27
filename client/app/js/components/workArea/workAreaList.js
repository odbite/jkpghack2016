'use strict';

angular.module('navotron.workAreaList', ['navotron.api'])

.directive("workAreaList", function(workAreaHelper, api) {

    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/workAreaListView.jade',
        controller: function($scope) {
            api.workareas.get().then(function(workareas) {
                $scope.workareas = workareas;
            });

            $scope.delete = function(workarea, index) {
                workAreaHelper.delete(workarea, index)
                .then(function(result) {
                    $scope.workareas.splice(index, 1);
                });
            };

        }
    };

});
