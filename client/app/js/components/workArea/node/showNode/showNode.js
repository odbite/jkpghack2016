'use strict';

angular.module('navotron.showNode', [
    'angucomplete-alt',
    'navotron.api',
    'navotron.keyword',
    'navotron.modifyField',
    'navotron.nodeHelper',
    'pageslide-directive',
    'ui.bootstrap',
])

.directive("showNode", function(nodeHelper, showNodeFactory, keywordHelper) {
    return {
        restrict: 'E',
        scope: {
            node: '=',
        },
        templateUrl: 'js/components/workArea/node/showNode/showNodeView.jade',
        link: function($scope) {
            $scope.showEditNode = false;

            $scope.$watch('node', function(newValue, oldValue) {
                if ( newValue === undefined ) {
                    return;
                }

                $scope.keywords = [];
                showNodeFactory.getKeywords({'nodes': $scope.node.id})
                .then(function(keywords) {
                    $scope.keywords = keywords;
                });
            });

            $scope.updateSearchKeywords = function() {
                showNodeFactory.getKeywords({})
                .then(function(keywords) {
                    $scope.searchKeywords = keywords;
                });
            };

            $scope.toggle = function() {
                $scope.showEditNode = !$scope.showEditNode;
            };

            $scope.addKeywordToNode = function(obj) {
                if (obj === undefined) {
                    return;
                }

                (function() {
                    if ('id' in obj.originalObject) {
                        var newKeywordList = [obj.originalObject].concat($scope.keywords);
                        return showNodeFactory.updateNode($scope.node, newKeywordList);
                    }

                    return showNodeFactory.createKeyword($scope.node, obj.originalObject.name);
                })()

                .then(function(keywords) {
                    $scope.keywords = keywords;
                    $scope.$broadcast('angucomplete-alt:clearInput');
                    $scope.updateSearchKeywords();
                });

            };

            $scope.removeKeyword = function(index) {
                var newKeywordList = angular.copy($scope.keywords);
                newKeywordList.splice(index, 1);

                showNodeFactory.updateNode($scope.node, newKeywordList)
                .then(function(keywords) {
                    $scope.keywords = keywords;
                });
            };

            $scope.updateSearchKeywords();
        }
    };
})

.service('showNodeFactory', function($modal, $stateParams, workAreaEvent, api, keywordHelper) {
    var self = this;

    self.convertList = function(list, key) {
        var returnList = [];
        angular.forEach(list, function(item) {
            this.push(item[key]);
        }, returnList);

        return returnList;
    };

    self.createKeyword = function(node, keywordName) {
        var newKeyword = keywordHelper.newKeyword({
            'keyword': keywordName,
            'workarea': $stateParams.workAreaId,
            'type': 'SECONDARY',
            'nodes': [node.id],
        });

        return workAreaEvent.wrap(api.keywords.post($stateParams.workAreaId, newKeyword))

        .then(function(keyword) {
            return self.getKeywords({'nodes': node.id});
        });
    };

    self.updateNode = function(node, keywords) {
        var nodeParams = {
            keywords: self.convertList(keywords, 'id'),
        };

        return workAreaEvent.wrap(api.nodes.patch($stateParams.workAreaId, node.id, nodeParams))

        .then(function(node) {
            return self.getKeywords({'nodes': node.id});
        });
    };

    self.getKeywords = function(params) {
        return workAreaEvent.wrap(api.keywords.get($stateParams.workAreaId, params));
    };

    self.addEmptyKeywords = function(keywords) {
        for (var i = 0; i < 4; i++) {
            if ( keywords[i] === undefined ) {
                keywords.push({});
            }
        }

        return keywords;
    };

});
