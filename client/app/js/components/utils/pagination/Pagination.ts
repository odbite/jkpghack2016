/// <reference path="./typings/angularjs/angular.d.ts" />

class Pagination<T> {
    $http: ng.IHttpService;
    response: any;
    baseUrl: string;
    params: any;
    loading: boolean;
    results: any[];

    constructor($http: ng.IHttpService, url) {
        this.$http = $http;
        this.response = null;
        this.params = {};
        this.baseUrl = url;
        this.loading = false;
        this.results = [];
    }

    refresh = (): any => {
        return this._get(this.params);
    }

    setParam = (key, value): void => {
        this.params[key] = value;
    }

    unsetParam = (key): void => {
        delete this.params[key];
    }

    _get = (params: any): any => {
        this.loading = true;
        return this.$http({
            method: 'GET',
            url: this.baseUrl,
            params: params,
        }).then(this._success);
    }

    _success = (response: any): any => {
        this.loading = false;
        this.response = response;
        this.results = this.response.data.results;
        return response;
    }
}
