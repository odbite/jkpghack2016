'use strict';

angular.module('navotron.previewText', [])

.directive('previewText', function() {
    return {
        restrict: 'E',
        require: '^preview',
        templateUrl: 'js/components/workArea/preview/previewText/previewText.jade',
        scope: {
            node: '=',
        },
        link: function(scope, element, attr, previewCtrl) {
            scope.previewCtrl = previewCtrl;
        },
    };
})

.directive('previewArea', function() {
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true,
        scope: {},
        replace: true,
        controller: function($scope) {
            var self = this;

            this.showHelp = function() {
                self.textColor = {color: 'red'};
            };

            this.hideHelp = function() {
                self.textColor = {color: 'auto'};
            };
        },
    };
})

.directive('previewSection', function() {
    return {
        restrict: 'EA',
        require: '^previewArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewText/previewSection.jade',
        scope: {},
        replace: true,
        link: function(scope, element, attrs, previewAreaCtrl) {
            scope.previewAreaCtrl = previewAreaCtrl;
        },
    };
})

.directive('previewQuestion', function() {
    return {
        restrict: 'EA',
        require: '^previewArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewText/previewQuestion.jade',
        scope: {},
        replace: true,
        link: function(scope, element, attrs, previewAreaCtrl) {
            scope.previewAreaCtrl = previewAreaCtrl;
        },
    };
});
