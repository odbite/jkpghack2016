'use strict';

angular.module('navotron.keywordList', [
    'navotron.api',
    'smart-table'
])

.config(function(stConfig) {
    stConfig.pagination.template = 'js/components/workArea/keyword/keywordList/pagination.jade';
    stConfig.pagination.itemsByPage = 10;
    stConfig.pagination.displayedPages = 0;
})

.controller('keywordListController', function(keywordListFactory) {
    this.keywordListFactory = keywordListFactory;
    this.keywordListFactory.init();
})

.directive('keywordList', function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/components/workArea/keyword/keywordList/keywordListView.jade',
    };
})

.service('keywordListFactory', function($modal, $stateParams, $state, api) {

    var self = this;
    self.keywords = {
        results: []
    };

    self.init = function() {
        self.keywords = api.keywords.getPaginated($stateParams.workAreaId);
    };

    self.removeKeywords = function() {
        var selectedKeywordIds = [];

        self.keywords.results.forEach(function(row) {
            if ( row.isSelected ) {
                this.push(row.id);
            }
        }, selectedKeywordIds);

        api.keywords.deleteBulk($stateParams.workAreaId, selectedKeywordIds)

        .finally(function(error) {
            $state.go('root.workArea.keywords', {}, {
                reload: true
            });
        });
    };

    self.addKeywords = function() {
        self.modalInstance = $modal.open({
            templateUrl: 'js/components/workArea/popups/addKeywords/addKeywordsView.jade',
            controller: 'addKeywords',
            resolve: {
                workAreaId: function() {
                    return $stateParams.workAreaId;
                },
                nodeId: function() {
                    return [];
                }
            }
        });

        self.modalInstance.result.then(function(lok) {
            $state.go('root.workArea.keywords', {}, {
                reload: true
            });
        });
    };
})

.directive('stSelect', function() {
    return {
        require: '^stTable',
        template: '<input type="checkbox" ng-checked="row.isSelected" />',
        scope: {
            row: '='
        },
        link: function(scope, element, attr, ctrl) {

            element.bind('change', function(evt) {
                scope.$apply(function() {
                    if (!scope.row.isSelected) {
                        scope.row.isSelected = true;
                    }
                    else {
                        scope.row.isSelected = false;
                    }
                });
            });

            scope.$watch('row.isSelected', function(newValue, oldValue) {
                if (newValue === true) {
                    element.parent().parent().addClass('st-selected');
                } else {
                    element.parent().parent().removeClass('st-selected');
                }
            });
        }
    };
})

.directive('stSelectAll', function() {
    return {
        restrict: 'E',
        template: '<input type="checkbox" ng-model="isAllSelected" />',
        scope: {
            all: '='
        },
        link: function(scope, element, attr) {

            scope.$watch('isAllSelected', function() {
                scope.all.forEach(function(val) {
                    val.isSelected = scope.isAllSelected;
                });
            });

            scope.$watch('all', function(newVal, oldVal) {
                if (oldVal) {
                    oldVal.forEach(function(val) {
                        val.isSelected = false;
                    });
                }

                scope.isAllSelected = false;
            });
        }
    };
});

