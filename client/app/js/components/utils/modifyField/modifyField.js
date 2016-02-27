'use strict';

angular.module('navotron.modifyField', [])

.directive('modifyField', function($timeout, $animate, modifyFieldFactory) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            field: '=',
            type: '=',
            onSave: '&',
            onBlur: '&',
        },
        templateUrl: 'js/components/utils/modifyField/modifyFieldView.jade',
        link: function($scope, elem, attr) {
            $animate.enabled(false, elem);
        },
        controller: function($scope) {
            $scope.editField = false;

            $scope.edit = function() {
                $scope.newValue = $scope.field;
                $scope.editField = true;
            };

            $scope.save = function() {
                if (modifyFieldFactory.isNewValue($scope.newValue, $scope.field)) {
                    var promise = modifyFieldFactory.save($scope.newValue, $scope.field, $scope.onSave);

                    promise.then(function(result) {
                        $scope.field = $scope.newValue;
                    });
                }

                $scope.editField = false;
            };
        }
    };
})

.service('modifyFieldFactory', function() {
    var self = this;

    // X Y FN -> FN
    // produce the result of the function FN
    self.save = function(newValue, oldValue, fn) {
        return fn({newVal: newValue, oldVal: oldValue});
    };

    // X Y -> Boolean
    // if the value or object is new then return true
    self.isNewValue = function(newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
            return false;
        }
        else if (newValue === oldValue) {
            return false;
        }
        else {
            return true;
        }
    };

});
