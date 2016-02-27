'use strict';

angular.module('navotron.addKeywords', ['navotron.api'])

.controller('addKeywords', function($scope, $modalInstance, createKeywords, workAreaId, nodeId, workAreaEvent, api) {
    $scope.add = function() {
        if ( $scope.keywordItems ) {
            var lok = createKeywords(workAreaId, nodeId, $scope.keywordItems.split('\n'));

            workAreaEvent.wrap(api.keywords.postBulk(workAreaId, lok))

            .then(function(keywords) {
                $modalInstance.close(keywords);
            });
        }
        else {
            $scope.cancel();
        }
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
})

.factory('createKeywords', function($filter) {

    // String (listof Integer) (listof String) -> Keyword
    // produce a keyword from a string, nodeIds and a workareaId
    var createKeyword = function(workAreaId, nodeIds, los) {

        var defaultKeyword = {
            'workarea': workAreaId,
            'timestamp': null,
            'keyword': los[0].trim(),
            'nodes': nodeIds
        };

        return defaultKeyword;
    };

    // Keyword (listof Keyword) -> Boolean
    // produce true if keyword is in the list of keywords
    var keywordInArray = function(k, lok) {
        var result = false;

        angular.forEach(lok, function(v) {
            if (v.keyword === k.keyword) {
                result = true;
            }
        });

        return result;
    };

    // String (listof Integer) (listof String) -> (listof Keyword)
    // produce a listof keyword from a listof string
    var processStrings = function(workAreaId, nodeIds, los) {
        var lok = [];
        var keyword;

        angular.forEach(los, function(s) {
            keyword = createKeyword(workAreaId, nodeIds, s.split(','));
            if (keywordInArray(keyword, this)) {
                return;
            }
            if (keyword.keyword === '') {
                return;
            }
            this.push(keyword);
        }, lok);

        return lok;
    };

    return processStrings;

});
