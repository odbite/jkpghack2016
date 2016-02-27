'use strict';

angular.module('navotron.popupBox', [])

.directive('popupBox', function($document) {
    return {
        restrict: 'EA',
        scope: {},
        link: function($scope, $element, $attributes) {
            var onDocumentClick = function(event) {
                var isChild = $($element).find(event.target).length > 0;
                var isSelf = ($element[0] === event.target);
                var isInside = isChild || isSelf;

                if(!isInside) {
                    $scope.$apply(function() {
                        $scope.close();
                    });
                }
            };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        },
        controller: function($scope) {
            $scope.show = false;

            this.open = function() {
                $scope.show = !$scope.show;
                $scope.$emit('popupBox.open');
            };

            $scope.close = function() {
                $scope.show = false;
            };

            this.isOpen = function() {
                return $scope.show;
            };

            $scope.$on('$stateChangeStart', function(next, current) {
                $scope.close();
            });
        }
    };
})

.directive('pbButton', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: 'js/components/navbar/popupBox/pbButton.jade',
        require: '^popupBox',
        link: function(scope, element, attrs, popupBoxCtrl) {
            scope.popupBox = popupBoxCtrl;
        },
    };
})

.directive('pbPanel', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: 'js/components/navbar/popupBox/pbPanel.jade',
        require: '^popupBox',
        link: function(scope, element, attrs, popupBoxCtrl) {
            scope.popupBox = popupBoxCtrl;
        },
    };
});
