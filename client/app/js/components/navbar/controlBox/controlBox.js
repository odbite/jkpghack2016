'use strict';

angular.module('navotron.controlBox', [
    'navotron.api',
    'navotron.popupBox',
])

.directive("controlBox", function(api, workAreaHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/controlBox/controlBoxView.jade',
        repalce: true,
        controller: function($scope) {
            $scope.users = api.users;
            $scope.getActiveWorkArea = workAreaHelper.getActiveWorkarea;

            $scope.$on('popupBox.open', function(event, args) {
                api.workareas.get().then(function(workareas) {
                    $scope.workareas = workareas;
                });
            });
        }
    };

});
