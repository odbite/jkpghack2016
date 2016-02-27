/// <reference path="./typings/angularjs/angular.d.ts" />
/// <reference path="./Pagination.ts" />

// Compile using: tsc --target ES5 stPagination.ts --out ts_stPagination.js

class stPagination<T> extends Pagination<T> {
    tableState: any;

    constructor($http: ng.IHttpService, url) {
        super($http, url);
        this.setParam('limit', 10);
    }

    get numberOfPages(): number {
        if (this.response === null) {
            return 0;
        }
        if (this.tableState === null) {
            return 0;
        }
        return Math.ceil(this.response.data.count / this.tableState.pagination.number)
    }

    // Simple table methods
    callServer = (tableState): void => {
        this.tableState = tableState;

        this.setOffsetParams();
        this.setOrderingParams();
        this.setSearchParams();

        this.refresh().then(() => {
            this.tableState.pagination.numberOfPages = this.numberOfPages;
        });
    }

    setOffsetParams = (): void => {
        this.setParam('limit', this.tableState.pagination.number || 10);
        this.setParam('offset', this.tableState.pagination.start || 0);
    }

    setOrderingParams = (): void => {
        var sort = this.tableState.sort;
        if (sort.predicate !== undefined) {
            var prefix = (sort.reverse ? '-' : '');
            this.setParam('ordering', prefix + sort.predicate);
        }else{
            this.unsetParam('ordering');
        }
    }

    setSearchParams = (): void => {
        var predicateObject = this.tableState.search.predicateObject;
        if (predicateObject !== undefined) {
            this.setParam('search', predicateObject.search);
        }else{
            this.unsetParam('search');
        }
    }
}

angular.module('navotron.pagination', [])

.factory('stPagination', function($http) {
    return function(url) {
        return new stPagination($http, url);
    };
});
