'use strict';

angular.module('navotron.apiKeywords', ['navotron.credits', 'navotron.pagination'])

.factory('keywords', function($http, buildQueryParams, creditFactory, stPagination) {

    return {

        // -> (listof Keyword) String
        // produce a list of all the keywords
        get: function(workareaId, params) {
            return $http.get(Urls.workarea_keywords_list(workareaId) + buildQueryParams(params))
            .then(function(result) {
                return result.data;
            });
        },

        getPaginated: function(workareaId) {
            return stPagination(Urls.workarea_keywords_list(workareaId));
        },

        // String Integer Keyword -> Keyword
        // patch a singel keyword
        patch: function(workareaId, keywordId, params) {
            return $http.patch(Urls.workarea_keywords_detail(workareaId, keywordId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String Keyword -> Keyword
        // create a singel keyword
        post: function(workareaId, params) {
            return $http.post(Urls.workarea_keywords_list(workareaId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String (listof Keyword) -> (listof Keyword)
        // create multiple keywords
        postBulk: function(workareaId, lok) {
            return $http.post(Urls.workarea_keywords_bulk_create(workareaId), lok)
            .then(function(result) {
                return result.data;
            });
        },

        // String Integer -> Keyword
        // remove a singel keyword
        delete: function(workareaId, keywordId) {
            return $http.delete(Urls.workarea_keywords_detail(workareaId, keywordId));
        },

        // String (listof Integer) -> Keyword
        // remove a singel keyword
        deleteBulk: function(workareaId, keywordIds) {
            return $http.delete(Urls.workarea_keywords_bulk(workareaId),
                                {
                                    data: angular.toJson(keywordIds),
                                    headers: {'Content-Type': 'application/json' },
                                });
        },

        // String -> Promise
        // updating the keywords volumes
        updateVolume: function(workareaId) {
            return $http.post(Urls.workarea_update_keywords(workareaId))
            .then(function(response) {
                return creditFactory.updateUnits().then(function() {
                    return response;
                });
            });
        },
    };
})

.factory('buildQueryParams', function() {

    function forEachSorted(obj, iterator, context) {
        var keys = sortedKeys(obj);
        for (var i = 0; i < keys.length; i++) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    function buildQueryParams(params) {
        var parts = [];
        forEachSorted(params, function(value, key) {
            if (value === null || value === undefined) {
                return;
            }
            if (angular.isObject(value)) {
                value = angular.toJson(value);
            }
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        return '?' + parts.join('&');
    }

    // Object -> String
    // produce a URL from a base URL and a object with parameters
    // Assume: The Object can not be empty.
    return buildQueryParams;

});
