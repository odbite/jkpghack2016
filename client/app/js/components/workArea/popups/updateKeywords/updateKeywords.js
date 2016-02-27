'use strict';

angular.module('navotron.updateKeywords', ['navotron.api'])

.controller('updateKeywords', function($scope, $modalInstance, workAreaId, currentNode, workAreaEvent, api) {

    $scope.updateCurrentKeywords = function() {
        $scope.updateChoice = 'current';
        $scope.keywords = currentNode.keywords;
    };

    $scope.updateAllKeywords = function() {
        $scope.updateChoice = 'all';

        workAreaEvent.wrap(api.keywords.get(workAreaId))

        .then(function(keywords) {
            $scope.keywords = keywords;
        });
    };

    $scope.updateKeywordVolume = function() {
        workAreaEvent.wrap(api.keywords.updateVolume(workAreaId))
        .then($scope.updateAllKeywords);
    };

    $scope.isCurrentUpdateChoice = function(updateChoice) {
        return (updateChoice === $scope.updateChoice);
    };

    $scope.add = function() {
        $modalInstance.close('result');
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.updateCurrentKeywords();
});
