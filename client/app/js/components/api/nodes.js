'use strict';

angular.module('navotron.apiNodes', ['navotron.cache'])

.factory('nodes', function($http, cache) {
    return {

        // String -> (listof Node)
        // produce a list of nested nodes from a workarea
        getNested: function(workareaId) {
            return $http.get(Urls.workarea_nodes_nested_list(workareaId), {cache: cache.get()})
            .then(function(result) {
                return result.data;
            });
        },

        // (listof Node) -> (listof Node)
        // save a list of nested node to the database
        postNested: function(workareaId, nodes) {
            cache.destroy();
            return $http.post(Urls.workarea_nodes_nested_create(workareaId), nodes)
            .then(function(result) {
                return result.data;
            });
        },

        // String Integer Node -> Node
        // patch a singel node
        patch: function(workareaId, nodeId, params) {
            cache.destroy();
            return $http.patch(Urls.workarea_nodes_detail(workareaId, nodeId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // (listof Node) -> (listof Node)
        // produce a list of nested nodes from a workarea
        patchBulk: function(workareaId, params) {
            cache.destroy();
            return $http.patch(Urls.workarea_nodes_bulk_update(workareaId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String Node -> Node
        // create a singel node
        post: function(workareaId, node) {
            cache.destroy();
            return $http.post(Urls.workarea_nodes_list(workareaId), node)
            .then(function(result) {
                return result.data;
            });
        },

        // String String -> Node
        // remove a singel node
        delete: function(workareaId, nodeId) {
            cache.destroy();
            return $http.delete(Urls.workarea_nodes_detail(workareaId, nodeId));
        },
    };
});
