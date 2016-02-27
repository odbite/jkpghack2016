'use strict';

angular.module('navotron.api', [
    'navotron.apiAnimals',
])

.factory('api', function(animals) {
    return {
        animals: animals,
    };
});
