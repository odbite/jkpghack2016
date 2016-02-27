'use strict';

angular.module('navotron.knowme', [
    'navotron.api'
])

.directive("knowme", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/knowme/knowme.jade',
        scope: {},
        controller: function($scope, $state) {
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
            // $scope.state = $state;

            // this.updateActiveNode = function(node) {
            //     nodeHelper.setActiveNode(node);
            //     $scope.activeNode = node;
        }
    };
});
