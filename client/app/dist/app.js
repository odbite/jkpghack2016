'use strict';

angular.module('navotron.config', [
    'navotron.notification'
])

.config(["$httpProvider", "notificationProvider", "oauth2Provider", function($httpProvider, notificationProvider, oauth2Provider) {

    // Do not cache http calls
    $httpProvider.defaults.cache = false;

    // Show notifications for 5 seconds
    notificationProvider.setTimeout(8000);

    // Configurations for the oauth2 provider
    oauth2Provider.setClientDetails({
        url: '/oauth2/token/',
        clientId: 'qT.pfokMO=1X.j6Pz4jB4L-.P_S1O9abTiFoqPj9',
        clientSecret: 'YeFV?UweZ6P!oeVFFIPN5NkicXB8tHFh@PC0ACZF@htyF4gxcb8iDd?VC2;E3bpkP_.ApQob!JtwolA0FJDc-DBzAHDZ8?dnmCMsMc1qTM8TcB!0C!.q?TYjpswEo2MX',
    });
}]);

'use strict';

angular.module('navotron.constants', [])

.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor'
});

'use strict';

angular.module('navotron', [
    'navotron.api',
    'navotron.authService',
    'navotron.broadcastInterceptor',
    'navotron.config',
    'navotron.run',
    'navotron.constants',
    'navotron.datadef',
    'navotron.directives',
    'navotron.navbar',
    'navotron.notification',
    'navotron.routes',
    'navotron.session',
    'navotron.templates',
    'navotron.knowme',

    'angular-extend-promises',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'uiGmapgoogle-maps'
]);

'use strict';

angular.module('navotron.routes', ['ui.router'])

.config(["$stateProvider", "$urlRouterProvider", "USER_ROLES", function($stateProvider, $urlRouterProvider, USER_ROLES) {

    // Default, if nothing matches go here.
    $urlRouterProvider.otherwise('/');

    $stateProvider

    .state('root', {
        url: '/',
        views: {
            '@' : { templateUrl: 'js/main.jade' },
            'header@root' : { template: '<navbar></navbar>' },
            'main@root' : { template: '<knowme></knowme>' },
            'footer@root' : { template: '' },
        }
    });

}]);

'use strict';

angular.module('navotron.run', [
    'navotron.api',
    'navotron.constants',
    'navotron.notification',
])

.run(["$rootScope", "$state", "notification", "api", "AUTH_EVENTS", function($rootScope, $state, notification, api, AUTH_EVENTS) {

    // What happens after a user is logged in
    $rootScope.$on(AUTH_EVENTS.loginSuccess, function(event, args) {
        $state.go('root', {}, {reload: true});
    });

    // What happens after a user is logged out
    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function(event, args) {
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if session is timed out
    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function(event, args) {
        api.users.logoutUser();
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if the user is not authrized to do a certain thing
    $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event, args) {
        notification.info('You do not have privilages to access that view.');
        $state.go('root.login', {}, {reload: true});
    });

    // What happens if the user is not authenticated
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event, args) {
        api.users.logoutUser();
        $state.go('root.login');
    });
}]);

'use strict';

angular.module('navotron.apiAnimals', ['navotron.cache'])

.factory('animals', ["$http", "cache", function($http, cache) {

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
}]);

'use strict';

angular.module('navotron.api', [
    'navotron.apiAnimals',
])

.factory('api', ["animals", function(animals) {
    return {
        animals: animals,
    };
}]);

'use strict';

angular.module('navotron.authService', ['navotron.authOauth2'])

.factory('authService', ["oauth2", "tokens", function(oauth2, tokens) {

    return {
        logoutUser: function() {
            tokens.destroy();
            tokens.load();
        },

        loginUser: function(username, password) {
            return oauth2.login(username, password);
        },

        // -> Boolean
        // produce true if the user has session and is logged in
        isAuthenticated: function() {
            return !!tokens.accessToken;
        },
    };
}]);

'use strict';

angular.module('navotron.authOauth2', ['LocalStorageModule'])

.provider('oauth2', function() {
    var clientId, clientSecret, url;

    function params(obj) {
        var str = [];
        for(var p in obj) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
        return str.join("&");
    }

    this.setClientDetails = function(config) {
        url = config.url;
        clientId = config.clientId;
        clientSecret = config.clientSecret;
    };

    this.$get = ["$http", "tokens", function($http, tokens) {

        function oauthLogin(data) {
            return $http({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: params(data),
            })
            .then(function(resp) {
                tokens.create(resp.data.access_token,
                              resp.data.refresh_token,
                              resp.data.expires_in);
                return resp;
            });
        }

        return {
            login: function(username, password) {
                return oauthLogin({
                    'grant_type': 'password',
                    'client_id': clientId,
                    'client_secret': clientSecret,
                    'username': username,
                    'password': password,
                });
            },
            refresh: function() {
                var refreshToken = tokens.refreshToken;
                tokens.destroy();

                return oauthLogin({
                    'grant_type': 'refresh_token',
                    'client_id': clientId,
                    'client_secret': clientSecret,
                    'refresh_token': refreshToken,
                });
            },
            refreshRequired: function() {
                if ( !tokens.accessToken ) {
                    return false;
                }

                return tokens.expiryDate <= Math.floor(Date.now() / 1000);
            }
        };
    }];
})

.service('tokens', ["localStorageService", function(localStorageService) {
    this.load = function() {
        this.accessToken = localStorageService.get('accessToken');
        this.refreshToken = localStorageService.get('refreshToken');
        this.expiryDate = localStorageService.get('expiryDate');
    };

    this.create = function(access_token, refresh_token, expires_in) {
        var expiryDate = Math.floor(Date.now() / 1000) + expires_in;
        localStorageService.set('accessToken', access_token);
        localStorageService.set('refreshToken', refresh_token);
        localStorageService.set('expiryDate', expiryDate);
        this.load();
    };

    this.destroy = function() {
        localStorageService.remove('accessToken');
        localStorageService.remove('refreshToken');
        localStorageService.remove('expiryDate');
        this.load();
    };

    this.load();
}])

.factory('tokenInterceptor', ["$injector", "tokens", function($injector, tokens) {
    return {
        request: function(config) {

            if (tokens.accessToken !== null) {
                angular.extend(config.headers, {
                    'Authorization': 'Bearer ' + tokens.accessToken
                });
            }

            if (config.url !== '/oauth2/token/') {
                var oauth2 = $injector.get('oauth2');
                if (oauth2.refreshRequired()) {
                    return oauth2.refresh().then(function() {
                        return config;
                    });
                }
            }

            return config;
        }
    };
}])

.config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('tokenInterceptor');
}]);

'use strict';

angular.module('navotron.knowme', [
    'navotron.api'
])

.directive("knowme", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/knowme/knowme.jade',
        scope: {},
        controller: ["$scope", "$state", function($scope, $state) {
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
            // $scope.state = $state;

            // this.updateActiveNode = function(node) {
            //     nodeHelper.setActiveNode(node);
            //     $scope.activeNode = node;
        }]
    };
});

'use strict';

angular.module('navotron.navbar', [
    'navotron.api',
])

.controller("navbarController", ["$state", "api", function($state, api) {
    this.users = api.users;
    this.includes = $state.includes;
}])

.directive("navbar", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/navbar.jade',
    };
});

'use strict';

angular.module('navotron.broadcastInterceptor', ['navotron.constants'])

.factory('broadcastInterceptor', ["$rootScope", "$q", "AUTH_EVENTS", function($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: function(response) {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
                403: AUTH_EVENTS.notAuthorized,
                419: AUTH_EVENTS.sessionTimeout,
                440: AUTH_EVENTS.sessionTimeout
            }[response.status], response);

            return $q.reject(response);
        }
    };
}])

.config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('broadcastInterceptor');
}]);

'use strict';

angular.module('navotron.cache', [])

.service('cache', ["$cacheFactory", "session", function($cacheFactory, session) {

    this.get = function() {
        if ( $cacheFactory.get(session.user.id) === undefined ) {
            return $cacheFactory(session.user.id);
        }
        return $cacheFactory.get(session.user.id);
    };

    this.destroy = function() {
        $cacheFactory.get(session.user.id).removeAll();
    };

}]);

'use strict';

angular.module('navotron.directives', [])

.directive('toSelect', ["$timeout", function($timeout) {
    return function(scope, elem, attrs) {
        scope.$watch(attrs.toSelect, function(newval) {
            if (newval) {
                $timeout(function() {
                    elem[0].select();
                }, 0, false);
            }
        });
    };
}])

.directive('onBlur', ["$parse", function($parse) {
    return function(scope, element, attr) {
        var fn = $parse(attr.onBlur);
        element.bind('blur', function(event) {
            scope.$apply(function() {
                fn(scope, {$event: event});
            });
        });
    };
}])

.directive('onEnterPress', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEnterPress, {'event': event});
                });
                event.preventDefault();
            }
        });
    };
})

.directive('onEscPress', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 27) {
                scope.$apply(function() {
                    scope.$eval(attrs.onEscPress, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});

'use strict';

angular.module('navotron.modifyField', [])

.directive('modifyField', ["$timeout", "$animate", "modifyFieldFactory", function($timeout, $animate, modifyFieldFactory) {
    return {
        restrict: 'E',
        transclude: false,
        scope: {
            field: '=',
            type: '=',
            onSave: '&',
            onBlur: '&',
        },
        templateUrl: 'js/components/utils/modifyField/modifyFieldView.jade',
        link: function($scope, elem, attr) {
            $animate.enabled(false, elem);
        },
        controller: ["$scope", function($scope) {
            $scope.editField = false;

            $scope.edit = function() {
                $scope.newValue = $scope.field;
                $scope.editField = true;
            };

            $scope.save = function() {
                if (modifyFieldFactory.isNewValue($scope.newValue, $scope.field)) {
                    var promise = modifyFieldFactory.save($scope.newValue, $scope.field, $scope.onSave);

                    promise.then(function(result) {
                        $scope.field = $scope.newValue;
                    });
                }

                $scope.editField = false;
            };
        }]
    };
}])

.service('modifyFieldFactory', function() {
    var self = this;

    // X Y FN -> FN
    // produce the result of the function FN
    self.save = function(newValue, oldValue, fn) {
        return fn({newVal: newValue, oldVal: oldValue});
    };

    // X Y -> Boolean
    // if the value or object is new then return true
    self.isNewValue = function(newValue, oldValue) {
        if (angular.equals(newValue, oldValue)) {
            return false;
        }
        else if (newValue === oldValue) {
            return false;
        }
        else {
            return true;
        }
    };

});

'use strict';

angular.module('navotron.notification', [])

.directive('ntNotification', ["notification", function(notification) {
    return {
        restrict: 'E',
        scope: {
        },
        templateUrl: 'js/components/utils/notification/notification.jade',
        link: function(scope, element, attrs) {
            scope.messages = notification.messages;
        }
    };
}])

.provider('notification', function() {
    var messages = [];
    var timeout = 5000;

    this.setTimeout = function(time) {
        timeout = time;
    };

    this.$get = ["$timeout", function($timeout) {
        function addMessage(msg, alertClass) {
            messages.push({
                message: msg,
                alertClass: alertClass,
            });

            $timeout(function() {
                messages.shift();
            }, timeout);
        }
        return {
            info: function(msg) {
                addMessage(msg, 'alert-info');
            },
            success: function(msg) {
                addMessage(msg, 'alert-success');
            },
            error: function(msg, reason) {
                addMessage(msg +
                           ' Status: ' + reason.status +
                           ' ErrorMsg: ' + reason.statusText, 'alert-danger');
            },
            messages: messages,
        };
    }];
});

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
    .factory('stPagination', ["$http", function ($http) {
    return function (url) {
        return new stPagination($http, url);
    };
}]);

'use strict';

angular.module('navotron.session', ['LocalStorageModule'])

.service('session', ["localStorageService", function(localStorageService) {
    this.load = function() {
        this.user = localStorageService.get('user');
        this.activeNode = localStorageService.get('activeNode');
        this.activeWorkArea = localStorageService.get('activeWorkArea');
    };

    this.set = function(name, value) {
        localStorageService.set(name, value);
        this.load();
    };

    this.destroy = function() {
        localStorageService.remove('user');
        this.activeNode = localStorageService.get('activeNode');
        localStorageService.remove('activeWorkArea');
    };

    this.hasSetProperty = function(key) {
        if ( localStorageService.get(key) === null ) {
            return false;
        }
        else {
            return true;
        }
    };

    this.load();
}]);

'use strict';

angular.module('navotron.datadef', [])

.factory('datadef', function() {

    var datadef = {};

    // DATADEFINITIONS
    // --------------------------------------------------

    // SearchParams is { search: String, ordering: String }
        // search           - The search string, will match *searchstring*.
        // ordering         - For asending order "name", for descending "-name".
        // limit            - Maximum number of items to return.
        // offset           - The offset indicates the starting position of the query.

    datadef.SP1 = { search: '', ordering: '', limit: '', offset: '' };
    datadef.SP2 = { search: '', ordering: 'name', limit: '0', offset: '10' };
    datadef.SP3 = { search: '', ordering: '-name', limit: '10', offset: '10' };
    datadef.SP4 = { search: 'linu', ordering: 'name', limit: '10', offset: '100' };

    // RestUrl is string:
    // interp. the URL used in rest calls.

        // | URL                                                    | VERB   | RESPONSE           |
        // ----------------------------------------------------------------------------------------
        // | /workareas                                             | GET    | LIST all WORKAREAS |
        // | /workareas                                             | POST   | SAVE WORKAREA      |
        // | /workareas/<integer>                                   | GET    | SHOW WORKAREA      |
        // | /workareas/<integer>                                   | PUT    | UPDATE WORKAREA    |
        // | /workareas/<integer>                                   | DELETE | DELETE WORKAREA    |

    datadef.RURL_WORKAREA_LIST = '/workareas';
    datadef.RURL_WORKAREA_DETAIL = '/workareas/123';

        // | URL                                                    | VERB   | RESPONSE           |
        // ----------------------------------------------------------------------------------------
        // | /workareas/<integer>/nodes                             | GET    | LIST all NODES     |
        // | /workareas/<integer>/nodes                             | POST   | SAVE NODE          |
        // | /workareas/<integer>/nodes/<integer>                   | GET    | SHOW NODE          |
        // | /workareas/<integer>/nodes/<integer>                   | PUT    | UPDATE NODE        |
        // | /workareas/<integer>/nodes/<integer>                   | DELETE | DELETE NODE        |

    datadef.RURL_NODE_LIST = '/workareas/123/nodes';
    datadef.RURL_NODE_DETAIL = '/workareas/123/nodes/123';

        // | URL                                                    | VERB   | RESPONSE              |
        // -------------------------------------------------------------------------------------------
        // | /workareas/<integer>/keywords                             | GET    | LIST all KEYWORDS  |
        // | /workareas/<integer>/keywords                             | POST   | SAVE KEYWORDS      |
        // | /workareas/<integer>/keywords/<integer>                   | GET    | SHOW KEYWORDS      |
        // | /workareas/<integer>/keywords/<integer>                   | PUT    | UPDATE KEYWORDS    |
        // | /workareas/<integer>/keywords/<integer>                   | DELETE | DELETE KEYWORDS    |

    datadef.RURL_NODE_LIST = '/workareas/123/nodes';
    datadef.RURL_NODE_DETAIL = '/workareas/123/nodes/123';

    // WorkArea is { hash_id : Integer, site_url : String, owner : Integer }:
        // hash_id          - the hash_id of the workarea
        // site_url         - the site_url of the workarea
        // owner            - the owner of the workarea
        // interp. a representation of the workarea

    datadef.WA1 = { 'hash_id' : 'asdasd', 'site_url' : 'http://linus-little-haven.se', 'owner' : 1, 'country': 'SE' };
    datadef.WA2 = { 'hash_id' : 'fwergwvfd', 'site_url' : 'http://my-special-place.se', 'owner' : 1, 'country': 'SE' };
    datadef.WA3 = { 'hash_id' : 'asdascdscae', 'site_url' : 'http://the-rankor-cave.se', 'owner' : 2, 'country': 'SE' };

        // function fn_for_work_area(wa) {
        //  return wa['hash_id']... wa['site_url']... wa['site_url']...
        // }


    // Element is { id : String, childNodes : (listof Element), nodeName : String, innerText : String, getAttribute : function() }:
        // id               - the id of the html element
        // childNodes       - the childNodes under a html element
        // nodeName         - the name of the node
        // innerText        - the text of the element
        // getAttribute     - a function that returns the attribute value from a element
        // interp. a html element in the dom

    //jscs:disable validateIndentation
    datadef.HTML1 = $.parseHTML(
        ['<ul>',
            '<li id="1" name="Home">',
                '<div>Home</div>',
            '</li>',
            '<li id="5" name="Category">',
                '<div>Category</div>',
                '<span>',
                    '<ul>',
                        '<li id="2" name="Produkt 1">',
                            '<div>Produkt 1</div>',
                        '</li>',
                        '<li id="3" name="Product 2">',
                            '<div>Product 2</div>',
                        '</li>',
                        '<li id="4" name="Product 3">',
                            '<div>Product 3</div>',
                        '</li>',
                    '</ul>',
                '</span>',
            '</li>',
        '</ul>'].join('\n'));
    //jscs:enable validateIndentation

        // function fn_for_element(n) {
        //  return n['id']... n['nodeName']... n['childNodes']... n['childNodes']...
        // }


    // SearchQuery is { keywords : (listof String), country : String, limit : Integer }
        // keywords         - Specifies the list of keywords to search against.
        // country          - Specifies the territory to search within. Two letter ISO country code or "global".
        // limit            - Specifies the number of returned results. (deafult 10)

    datadef.SQ1 = {
        'keywords': ['vår', 'fast elpris', 'elavtal'],
        'country': 'se',
        'limit': 100,
    };

    datadef.SQ2 = {
        'keywords': ['party', 'moped'],
        'country': 'en',
        'limit': 100,
    };

    datadef.SQ3 = {
        'keywords': ['i_do_not_exist_as_a_keyword', 'neither_do_I_my_friend'],
        'country': 'en',
        'limit': 100,
    };

        // function fn_for_search_query(n) {
        //  return n['keywords']... n['country']... n['limit']...
        // }


    // Keyword is { volume : Integer, timestamp : String, country : String, keyword : String }
        // volume           - Number of searches.
        // timestamp        - Has the highest date value from the specified range of dates.
        // country          - Specifies the territory to search within. Two letter ISO country code or 'global'.
        // keyword          - The keword that was searched for.

    datadef.SV1 = {
        'volume': 5400,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'comics'
    };

    datadef.SV2 = {
        'volume': 9900,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'comic'
    };

    datadef.SV3 = {
        'volume': 9900,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'batman comic'
    };

    datadef.SV4 = {
        'volume': 70,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'green lantern comic'
    };

    datadef.SV5 = {
        'volume': 390,
        'timestamp': '2014-08-01',
        'country': 'EN',
        'keyword': 'superman comic'
    };

        // function fn_for_search_query(n) {
        //  return n['volume']... n['timestamp']... n['country']... n['keyword']...
        // }


    // SearchVolumeResult is { result : (listof Keyword), total : Integer, took :  Integer }
        // result           - The result of the search on keywords with search volume, can be empty
        // total            - The amount of keywords that where returned in the request
        // took             - The amount of time the request took in milliseconds. (I think)

    datadef.SVR1 = {
        'results': [
            datadef.SV1,
            datadef.SV2,
            datadef.SV3
        ],
        'total': 3,
        'took': 2
    };

    datadef.SVR2 = {
        'results': [],
        'total': 0,
        'took': 2
    };

        // function fn_for_search_query(n) {
        //  return n['results']... n['total']... n['took']...
        // }

    // Node is { id : Integer, name : String, children : (listof Node), keywords : (listof Keyword) }:
        // id           - the id for the node
        // name         - the name of the node
        // children     - a list of childnodes, can be empty
        // keywords     - a list of keywords connected to the node
        // parentNode   - the parent node id
        // workarea     - the hash_id of the workarea
        // index        - an index to indicate the order of the nodes
        // interp. a representation of a node i in a treestructure

    datadef.N1 = { 'id' : '1', 'index': 0, 'parentNode' : null, 'workarea' : '1',  'name' : 'Home', 'children' : [], 'keywords' : [] };
    datadef.N2 = { 'id' : '2', 'index': 0, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Superman', 'children' : [], 'keywords' : [datadef.SV5] };
    datadef.N3 = { 'id' : '3', 'index': 1, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Batman', 'children' : [], 'keywords' : [datadef.SV3] };
    datadef.N4 = { 'id' : '4', 'index': 2, 'parentNode' : 5, 'workarea' : '1',  'name' : 'Green Lantern', 'children' : [], 'keywords' : [datadef.SV4] };
    datadef.N5 = { 'id' : '5', 'index': 1, 'parentNode' : null, 'workarea' : '1',  'name' : 'Comics', 'children' : [datadef.N2, datadef.N3, datadef.N4], 'keywords' : [datadef.SV1, datadef.SV2] };
    datadef.N6 = { 'id' : '6', 'index': 2, 'parentNode' : null, 'workarea' : '1',  'name' : 'About us', 'children' : [], 'keywords' : [] };
    datadef.N7 = { 'id' : '7', 'index': 3, 'parentNode' : null, 'workarea' : '1',  'name' : 'Contact us', 'children' : [], 'keywords' : [] };

        // EXAMPLE:
        // root
        // - Home
        // - Category
        //      - Product 1
        //      - Product 2
        //      - Product 3
        // - About us
        // - Contact us

        // function fn_for_node(n) {
        //  return n['id']... n['name']... n['children']... n['keywords']...
        // }

    return datadef;

});
