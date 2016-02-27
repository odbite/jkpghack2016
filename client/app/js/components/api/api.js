'use strict';

angular.module('navotron.api', [
    'navotron.apiKeywords',
    'navotron.apiNodes',
    'navotron.apiUsers',
    'navotron.apiWorkArea',
    'navotron.apiCredits',
])

.factory('api', function(workareas, nodes, users, keywords, credits) {
    return {
        workareas: workareas,
        nodes: nodes,
        users: users,
        keywords: keywords,
        credits: credits,
    };
});
