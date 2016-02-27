'use strict';

angular.module('navotron.apiCredits', [])

.factory('credits', function($http) {
    return {
        get: function(workareaId) {
            return $http.get(Urls.credit_list())
            .then(function(result) {
                return result.data;
            });
        },

        postCreditOrder: function(units) {
            return $http.post(Urls.creditorder_list(), {'units': units})
            .then(function(result) {
                return result.data;
            });
        },

        deleteCreditOrder: function(id) {
            return $http.delete(Urls.creditorder_detail(id));
        },
    };
});
