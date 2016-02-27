/// <reference path="./typings/angularjs/angular.d.ts" />
var Pagination = (function () {
    function Pagination($http, url) {
        var _this = this;
        this.refresh = function () {
            return _this._get(_this.params);
        };
        this.setParam = function (key, value) {
            _this.params[key] = value;
        };
        this.unsetParam = function (key) {
            delete _this.params[key];
        };
        this._get = function (params) {
            _this.loading = true;
            return _this.$http({
                method: 'GET',
                url: _this.baseUrl,
                params: params,
            }).then(_this._success);
        };
        this._success = function (response) {
            _this.loading = false;
            _this.response = response;
            _this.results = _this.response.data.results;
            return response;
        };
        this.$http = $http;
        this.response = null;
        this.params = {};
        this.baseUrl = url;
        this.loading = false;
        this.results = [];
    }
    return Pagination;
})();
/// <reference path="./typings/angularjs/angular.d.ts" />
/// <reference path="./Pagination.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// Compile using: tsc --target ES5 stPagination.ts --out ts_stPagination.js
var stPagination = (function (_super) {
    __extends(stPagination, _super);
    function stPagination($http, url) {
        var _this = this;
        _super.call(this, $http, url);
        // Simple table methods
        this.callServer = function (tableState) {
            _this.tableState = tableState;
            _this.setOffsetParams();
            _this.setOrderingParams();
            _this.setSearchParams();
            _this.refresh().then(function () {
                _this.tableState.pagination.numberOfPages = _this.numberOfPages;
            });
        };
        this.setOffsetParams = function () {
            _this.setParam('limit', _this.tableState.pagination.number || 10);
            _this.setParam('offset', _this.tableState.pagination.start || 0);
        };
        this.setOrderingParams = function () {
            var sort = _this.tableState.sort;
            if (sort.predicate !== undefined) {
                var prefix = (sort.reverse ? '-' : '');
                _this.setParam('ordering', prefix + sort.predicate);
            }
            else {
                _this.unsetParam('ordering');
            }
        };
        this.setSearchParams = function () {
            var predicateObject = _this.tableState.search.predicateObject;
            if (predicateObject !== undefined) {
                _this.setParam('search', predicateObject.search);
            }
            else {
                _this.unsetParam('search');
            }
        };
        this.setParam('limit', 10);
    }
    Object.defineProperty(stPagination.prototype, "numberOfPages", {
        get: function () {
            if (this.response === null) {
                return 0;
            }
            if (this.tableState === null) {
                return 0;
            }
            return Math.ceil(this.response.data.count / this.tableState.pagination.number);
        },
        enumerable: true,
        configurable: true
    });
    return stPagination;
})(Pagination);
angular.module('navotron.pagination', [])
    .factory('stPagination', function ($http) {
    return function (url) {
        return new stPagination($http, url);
    };
});
