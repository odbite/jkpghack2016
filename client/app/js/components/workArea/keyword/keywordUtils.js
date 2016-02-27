'use strict';

angular.module('navotron.keyword', ['navotron.api'])

.service('keywordHelper', function(workAreaEvent, api, notification) {

    // String Integer KeywordParams -> Promise
    // produce true if successfull
    this.patchKeyword = function(workAreaId, keywordId, params) {
        return workAreaEvent.wrap(api.keywords.patch(workAreaId, keywordId, params))

        .then(function(keyword) {
            return true;
        })

        .catch(function(reason) {
            notification.error('Could not update the keyword.', reason);
            return false;
        });
    };

    // Object -> Keyword
    // produce a keyword
    this.newKeyword = function(keyword) {
        return {
            keyword: keyword.keyword,
            adult: typeof keyword.adult !== 'undefined' ? keyword.adult : 'UNKNOWN',
            nodes: typeof keyword.nodes !== 'undefined' ? keyword.nodes : [],
            timestamp: typeof keyword.timestamp !== 'undefined' ? keyword.timestamp : null,
            type: typeof keyword.type !== 'undefined' ? keyword.type : "UNKNOWN",
            volume: typeof keyword.volume !== 'undefined' ? keyword.volume : 0,
            workarea: typeof keyword.workarea !== 'undefined' ? keyword.workarea : "UNKNOWN",
        };
    };
});
