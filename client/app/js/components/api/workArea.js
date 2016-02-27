'use strict';

angular.module('navotron.apiWorkArea', ['navotron.cache'])

.factory('workareas', function($http, cache) {

    return {

        // String String (listof Node) (listof Keyword) -> WorkArea
        // save a new workarea to the database, or 403 forbidden request
        post: function(params) {
            cache.destroy();
            return $http.post(Urls.workarea_list(), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String Workarea -> Workarea
        // patch a workarea
        patch: function(workareaId, params) {
            cache.destroy();
            return $http.patch(Urls.workarea_detail(workareaId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String (listof Node) -> (listof Node)
        // update a existing workarea
        put: function(workareaId, params) {
            cache.destroy();
            return $http.put(Urls.workarea_detail(workareaId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String -> String
        // produce a 204 if successfully deleted the workarea
        delete: function(workareaId) {
            cache.destroy();
            return $http.delete(Urls.workarea_detail(workareaId));
        },

        // -> (listof Workarea)
        // produce a list of all the available Workareas
        get: function() {
            return $http.get(Urls.workarea_list(), {cache: cache.get()})
            .then(function(result) {
                return result.data;
            });
        },

        // String -> Workarea
        // produce a Workarea from a given workareaId
        getOne: function(workareaId) {
            return $http.get(Urls.workarea_detail(workareaId), {cache: cache.get()})
            .then(function(result) {
                return result.data;
            });
        },
    };
});
