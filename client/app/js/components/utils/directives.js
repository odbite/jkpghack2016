'use strict';

angular.module('navotron.directives', [])

.directive('toSelect', function($timeout) {
    return function(scope, elem, attrs) {
        scope.$watch(attrs.toSelect, function(newval) {
            if (newval) {
                $timeout(function() {
                    elem[0].select();
                }, 0, false);
            }
        });
    };
})

.directive('onBlur', function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr.onBlur);
        element.bind('blur', function(event) {
            scope.$apply(function() {
                fn(scope, {$event: event});
            });
        });
    };
})

.directive('onEnterPress', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEnterPress, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
})

.directive('onEscPress', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 27) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEscPress, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});
