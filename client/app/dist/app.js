'use strict';

angular.module('navotron.config', [
    'navotron.notification',
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
    'navotron.credits',
    'navotron.datadef',
    'navotron.directives',
    'navotron.login',
    'navotron.navbar',
    'navotron.notification',
    'navotron.resolver',
    'navotron.routes',
    'navotron.session',
    'navotron.workAreaSettings',
    'navotron.templates',
    'navotron.workArea',
    'navotron.workAreaList',

    'angular-extend-promises',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap'
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
            'main@root' : { template: '<work-area-list></work-area-list>' },
            'footer@root' : { template: '' },
        },
        data: {
            authorizedRoles: [USER_ROLES.editor]
        },
    })

    .state('root.workAreaSettings', {
        url: 'settings',
        views: {
            'main@root' : { template: '<work-area-settings></work-area-settings>' },
        },
    })
    .state('root.login', {
        url: 'login',
        views: {
            'main@root' : { template: '<login username="currentUser" is-authenticated="isAuthenticated"></login>' },
        },
        data: {
            authorizedRoles: []
        },
    })
    .state('root.settings', {
        url: 'user/settings',
        views: {
            'main@root' : { template: '<settings></settings>' },
        },
    })
    .state('root.credits', {
        url: 'credits',
        views: {
            'main@root' : { template: '<credits></credits>' },
        },
    })

    .state('root.workArea', {
        url: 'workarea/:workAreaId',
        views: {
            'main@root' : { template: '<work-area></work-area>' },
        },
        resolve: {
            currentWorkArea: ["workAreaResolver", "$stateParams", function(workAreaResolver, $stateParams) {
                return workAreaResolver($stateParams.workAreaId);
            }],
            currentNodes: ["nodeResolver", "$stateParams", function(nodeResolver, $stateParams) {
                return nodeResolver($stateParams.workAreaId);
            }],
        },
        abstract: true,
    })
    .state('root.workArea.navigation', {
        url: '/',
        views: {
            '@root.workArea' : {
                template: '<node-area nodes="nodes" work-area="workArea"></node-area>',
                controller: ["$scope", "currentWorkArea", "currentNodes", function($scope, currentWorkArea, currentNodes) {
                    $scope.workArea = currentWorkArea;
                    $scope.nodes = currentNodes;
                }],
            },
        },
    })
    .state('root.workArea.preview', {
        url: '/preview',
        views: {
            '@root.workArea' : {
                template: '<preview nodes="nodes"></preview>',
                controller: ["$scope", "currentWorkArea", "currentNodes", function($scope, currentWorkArea, currentNodes) {
                    $scope.workArea = currentWorkArea;
                    $scope.nodes = currentNodes;
                }],
            },
        },
    })
    .state('root.workArea.keywords', {
        url: '/keywords',
        views: {
            '@root.workArea' : {
                template: '<keyword></keyword>',
            },
        },
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

    // Check if user role can access the view accoring to its group
    $rootScope.$on('$stateChangeStart', function(event, next) {
        var authorizedRoles = next.data.authorizedRoles;

        if (!api.users.isAuthorized(authorizedRoles)) {
            event.preventDefault();

            if (api.users.isAuthenticated()) {
                // user is not allowed
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized, {});
            }
            else {
                // user is not logged in
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, {});
            }
        }
    });
}]);

'use strict';

angular.module('navotron.api', [
    'navotron.apiKeywords',
    'navotron.apiNodes',
    'navotron.apiUsers',
    'navotron.apiWorkArea',
    'navotron.apiCredits',
])

.factory('api', ["workareas", "nodes", "users", "keywords", "credits", function(workareas, nodes, users, keywords, credits) {
    return {
        workareas: workareas,
        nodes: nodes,
        users: users,
        keywords: keywords,
        credits: credits,
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

angular.module('navotron.apiCredits', [])

.factory('credits', ["$http", function($http) {
    return {
        get: function(workareaId) {
            return $http.get(Urls.credit_list())
            .then(function(result) {
                return result.data;
            });
        },

        postCreditOrder: function(units) {
            return $http.post(Urls.creditorder_list(), {'units': units})
            .then(function(result) {
                return result.data;
            });
        },

        deleteCreditOrder: function(id) {
            return $http.delete(Urls.creditorder_detail(id));
        },
    };
}]);

'use strict';

angular.module('navotron.apiKeywords', ['navotron.credits', 'navotron.pagination'])

.factory('keywords', ["$http", "buildQueryParams", "creditFactory", "stPagination", function($http, buildQueryParams, creditFactory, stPagination) {

    return {

        // -> (listof Keyword) String
        // produce a list of all the keywords
        get: function(workareaId, params) {
            return $http.get(Urls.workarea_keywords_list(workareaId) + buildQueryParams(params))
            .then(function(result) {
                return result.data;
            });
        },

        getPaginated: function(workareaId) {
            return stPagination(Urls.workarea_keywords_list(workareaId));
        },

        // String Integer Keyword -> Keyword
        // patch a singel keyword
        patch: function(workareaId, keywordId, params) {
            return $http.patch(Urls.workarea_keywords_detail(workareaId, keywordId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String Keyword -> Keyword
        // create a singel keyword
        post: function(workareaId, params) {
            return $http.post(Urls.workarea_keywords_list(workareaId), params)
            .then(function(result) {
                return result.data;
            });
        },

        // String (listof Keyword) -> (listof Keyword)
        // create multiple keywords
        postBulk: function(workareaId, lok) {
            return $http.post(Urls.workarea_keywords_bulk_create(workareaId), lok)
            .then(function(result) {
                return result.data;
            });
        },

        // String Integer -> Keyword
        // remove a singel keyword
        delete: function(workareaId, keywordId) {
            return $http.delete(Urls.workarea_keywords_detail(workareaId, keywordId));
        },

        // String (listof Integer) -> Keyword
        // remove a singel keyword
        deleteBulk: function(workareaId, keywordIds) {
            return $http.delete(Urls.workarea_keywords_bulk(workareaId),
                                {
                                    data: angular.toJson(keywordIds),
                                    headers: {'Content-Type': 'application/json' },
                                });
        },

        // String -> Promise
        // updating the keywords volumes
        updateVolume: function(workareaId) {
            return $http.post(Urls.workarea_update_keywords(workareaId))
            .then(function(response) {
                return creditFactory.updateUnits().then(function() {
                    return response;
                });
            });
        },
    };
}])

.factory('buildQueryParams', function() {

    function forEachSorted(obj, iterator, context) {
        var keys = sortedKeys(obj);
        for (var i = 0; i < keys.length; i++) {
            iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
    }

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    function buildQueryParams(params) {
        var parts = [];
        forEachSorted(params, function(value, key) {
            if (value === null || value === undefined) {
                return;
            }
            if (angular.isObject(value)) {
                value = angular.toJson(value);
            }
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        });
        return '?' + parts.join('&');
    }

    // Object -> String
    // produce a URL from a base URL and a object with parameters
    // Assume: The Object can not be empty.
    return buildQueryParams;

});

'use strict';

angular.module('navotron.apiNodes', ['navotron.cache'])

.factory('nodes', ["$http", "cache", function($http, cache) {
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
}]);

'use strict';

angular.module('navotron.apiUsers', [
    'navotron.authService',
    'navotron.constants',
    'navotron.session',
])

.factory('users', ["$http", "$rootScope", "authService", "session", "AUTH_EVENTS", function($http, $rootScope, authService, session, AUTH_EVENTS) {
    return {
        // String -> User
        // produce a user object with groups and username
        getCurrentUser: function() {
            return $http.get(Urls.user_current_user())
            .then(function(result) {
                return result.data;
            });
        },

        loginUser: function(username, password) {
            var self = this;

            authService.loginUser(username, password).then(function(result) {
                self.getCurrentUser().then(function(user) {
                    session.set('user', user);
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                });
            });
        },

        logoutUser: function() {
            authService.logoutUser();
            session.destroy();
            session.load();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        },

        getUsername: function() {
            if ( session.user !== null ) {
                return session.user.username;
            }

            return undefined;
        },

        getUserGroup: function() {
            if ( session.user !== null ) {
                return session.user.groups[0];
            }

            return undefined;
        },

        isAuthorized: function(authorizedRoles) {
            if (authorizedRoles.length < 1) {
                return true;
            }

            return (authorizedRoles.indexOf(this.getUserGroup()) !== -1);
        },

        isAuthenticated: authService.isAuthenticated,
    };
}]);

'use strict';

angular.module('navotron.apiWorkArea', ['navotron.cache'])

.factory('workareas', ["$http", "cache", function($http, cache) {

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

angular.module('navotron.credits', ['navotron.apiCredits'])

.service('creditFactory', ["credits", "$http", "$timeout", function(credits, $http, $timeout) {
    var self = this;

    self.units = 0;
    self.lastOrder = undefined;
    var timeout = null;

    self.updateUnits = function() {
        return credits.get()
        .then(function(data) {
            self.units = data.units;
            return self.units;
        });
    };

    self.orderCredits = function(units) {
        self.errorMessage = '';

        return credits.postCreditOrder(units)
        .then(function(data) {
            self.lastOrder = data;
            $timeout.cancel(timeout);
            timeout = $timeout(function() {
                self.lastOrder = undefined;
            }, 60000);
        })
        .catch(function(response) {
            self.lastOrder = undefined;
            self.errorMessage = response.data.detail;
        });
    };

    self.undoOrder = function() {
        if (self.lastOrder !== undefined) {
            return credits.deleteCreditOrder(self.lastOrder.id)
            .then(function(response) {
                self.lastOrder = undefined;
            });
        }
    };

    self.estimateCost = function(seedCount) {
        return Math.ceil(seedCount / 100) * 10;
    };

    self.searchDisabled = function(seedCount) {
        return self.units < self.estimateCost(seedCount);
    };
}])

.controller('creditController', ["creditFactory", function(creditFactory) {
    this.creditFactory = creditFactory;
    this.creditFactory.updateUnits();
}])

.directive('credits', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/credits/credits.jade',
    };
})

.directive('creditPackage', function() {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            price: '@',
            units: '@',
        },
        templateUrl: 'js/components/credits/creditPackage.jade',
        controller: ["$scope", "creditFactory", function($scope, creditFactory) {
            $scope.buy = function() {
                creditFactory.orderCredits(parseInt($scope.units, 10));
            };
        }],
    };
});

'use strict';

angular.module('navotron.login', ['navotron.api'])

.directive("login", ["api", function(api) {

    return {
        restrict: 'E',
        templateUrl: 'js/components/login/loginView.jade',
        scope: {},
        controller: ["$scope", function($scope) {
            $scope.users = api.users;
        }]
    };

}]);

'use strict';

angular.module('navotron.controlBox', [
    'navotron.api',
    'navotron.popupBox',
])

.directive("controlBox", ["api", "workAreaHelper", function(api, workAreaHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/controlBox/controlBoxView.jade',
        repalce: true,
        controller: ["$scope", function($scope) {
            $scope.users = api.users;
            $scope.getActiveWorkArea = workAreaHelper.getActiveWorkarea;

            $scope.$on('popupBox.open', function(event, args) {
                api.workareas.get().then(function(workareas) {
                    $scope.workareas = workareas;
                });
            });
        }]
    };

}]);

'use strict';

angular.module('navotron.navbar', [
    'navotron.api',
    'navotron.controlBox',
    'navotron.credits'
])

.controller("navbarController", ["$state", "api", "workAreaHelper", "creditFactory", function($state, api, workAreaHelper, creditFactory) {
    this.users = api.users;
    this.includes = $state.includes;
    this.workAreaHelper = workAreaHelper;
    this.creditFactory = creditFactory;

    this.creditFactory.updateUnits();
}])

.directive("navbar", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/navbar/navbar.jade',
    };
});

'use strict';

angular.module('navotron.popupBox', [])

.directive('popupBox', ["$document", function($document) {
    return {
        restrict: 'EA',
        scope: {},
        link: function($scope, $element, $attributes) {
            var onDocumentClick = function(event) {
                var isChild = $($element).find(event.target).length > 0;
                var isSelf = ($element[0] === event.target);
                var isInside = isChild || isSelf;

                if(!isInside) {
                    $scope.$apply(function() {
                        $scope.close();
                    });
                }
            };

            $document.on("click", onDocumentClick);

            $element.on('$destroy', function() {
                $document.off("click", onDocumentClick);
            });
        },
        controller: ["$scope", function($scope) {
            $scope.show = false;

            this.open = function() {
                $scope.show = !$scope.show;
                $scope.$emit('popupBox.open');
            };

            $scope.close = function() {
                $scope.show = false;
            };

            this.isOpen = function() {
                return $scope.show;
            };

            $scope.$on('$stateChangeStart', function(next, current) {
                $scope.close();
            });
        }]
    };
}])

.directive('pbButton', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: 'js/components/navbar/popupBox/pbButton.jade',
        require: '^popupBox',
        link: function(scope, element, attrs, popupBoxCtrl) {
            scope.popupBox = popupBoxCtrl;
        },
    };
})

.directive('pbPanel', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: true,
        templateUrl: 'js/components/navbar/popupBox/pbPanel.jade',
        require: '^popupBox',
        link: function(scope, element, attrs, popupBoxCtrl) {
            scope.popupBox = popupBoxCtrl;
        },
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

angular.module('navotron.controlPanel', ['navotron.workArea'])

.directive('controlPanel', ["workAreaEvent", "session", "workAreaHelper", function(workAreaEvent, session, workAreaHelper) {
    return {
        restrict: 'E',
        scope: {},
        link: function($scope) {
            $scope.editing = workAreaEvent.editing;
            $scope.workArea = session.activeWorkArea;

            $scope.patchWorkArea = function(workArea, newVal) {
                return workAreaHelper.patchWorkarea(workArea.hash_id, newVal)

                .then(function(workArea) {
                    workAreaHelper.setActiveWorkarea(workArea);
                });
            };
        },
        templateUrl: 'js/components/workArea/controlPanel/controlPanelView.jade',

    };
}]);

'use strict';

angular.module('navotron.keywords', [
    'navotron.keywordList',
    'navotron.keywordSearch',
])

.directive('keyword', ["workAreaHelper", function(workAreaHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/keyword/keyword.jade',
        scope: {},
        link: function(scope, element, attr) {
            scope.activeWorkarea = workAreaHelper.getActiveWorkarea();
        },
    };
}]);

'use strict';

angular.module('navotron.keywordList', [
    'navotron.api',
    'smart-table'
])

.config(["stConfig", function(stConfig) {
    stConfig.pagination.template = 'js/components/workArea/keyword/keywordList/pagination.jade';
    stConfig.pagination.itemsByPage = 10;
    stConfig.pagination.displayedPages = 0;
}])

.controller('keywordListController', ["keywordListFactory", function(keywordListFactory) {
    this.keywordListFactory = keywordListFactory;
    this.keywordListFactory.init();
}])

.directive('keywordList', function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/components/workArea/keyword/keywordList/keywordListView.jade',
    };
})

.service('keywordListFactory', ["$modal", "$stateParams", "$state", "api", function($modal, $stateParams, $state, api) {

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
}])

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


'use strict';

angular.module('navotron.keywordSearch', [])

.directive('keywordSearch', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/keyword/keywordSearch/keywordSearch.jade',
        scope: {
            activeWorkarea: '=',
        },
        link: function(scope) {
            scope.searchMonth = new Date();
        },
    };
});

'use strict';

angular.module('navotron.keyword', ['navotron.api'])

.service('keywordHelper', ["workAreaEvent", "api", "notification", function(workAreaEvent, api, notification) {

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
}]);

'use strict';

angular.module('navotron.nodeArea', [
    'navotron.nodeTree',
    'navotron.nodeParent',
])

.controller('nodeAreaController', ["$scope", "nodeAreaFactory", function($scope, nodeAreaFactory) {
    this.nodeAreaFactory = nodeAreaFactory;
}])

.directive('nodeArea', ["nodeAreaFactory", "nodeHelper", "api", "session", function(nodeAreaFactory, nodeHelper, api, session) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/node/nodeArea/nodeArea.jade',
        scope: {
            nodes: '=',
            workArea: '=',
        },
        controller: ["$scope", function($scope) {
            this.updateIndexes = function() {
                nodeAreaFactory.updateIndexes($scope.workArea.hash_id, $scope.subNodes);
            };
        }],
        link: function($scope) {
            $scope.nodeParent = $scope.nodes.slice(0, 1)[0];
            $scope.subNodes = nodeAreaFactory.splitNodes($scope.nodes.slice(1, $scope.nodes.length));

            $scope.$watch('subNodes', function(newValue, oldValue) {
                $scope.subNodes = nodeAreaFactory.addEmptyNodeLists(newValue);
            }, true);
        }
    };
}])

.service('nodeAreaFactory', ["api", "workAreaEvent", "nodeHelper", function(api, workAreaEvent, nodeHelper) {

    // (listof Nodes) -> (listof (listof Nodes))
    // split up the diffrent nodes into sub trees
    this.splitNodes = function(nodes) {
        var result = [];
        var subNodes = [];

        angular.forEach(nodes, function(item) {
            subNodes[item.id] = [item];
            this.push(subNodes[item.id]);
        }, result);

        return result;
    };

    // (listof (listof Nodes)) -> (listof Nodes)
    // produce a flatten list of nodes
    this.collapseNodes = function(subNodes) {
        var result = [];

        angular.forEach(subNodes, function(item) {
            result.push.apply(result, item);
        });

        return result;
    };

    // (listof (listof Nodes)) -> (listof (listof Nodes))
    // produce a node list with empty nodelists
    this.addEmptyNodeLists = function(nodes) {
        var subNodes = [];

        angular.forEach(nodes, function(item) {
            if ( item.length > 0 ) {
                this.push([]);
                this.push(item);
            }
        }, subNodes);

        subNodes.push([]);

        return subNodes;
    };

    // String (listof (listof Nodes)) (listof Nodes) Integer ->
    // add a new node to the top of the nodetree
    this.addNewTopNode = function(workAreaId, subNodes, index) {
        var self = this;
        var newIndex = typeof index !== 'undefined' ? index + 1 : subNodes.length;

        // Set parameters
        var node = {
            'name': 'New page',
            'parentNode': null,
            'lock': true,
            'index': newIndex,
            'workarea': workAreaId,
        };

        // Create new node under parent
        var newNode = nodeHelper.newNode(node);

        // Add node to database
        workAreaEvent.wrap(api.nodes.post(workAreaId, newNode))

        .then(function(savedNode) {
            subNodes.splice(newIndex, 0, [savedNode]);
            self.updateIndexes(workAreaId, subNodes);
        });
    };

    this.updateIndexes = function(workAreaId, subNodes) {
        var i = 1;
        var nodes = [];

        angular.forEach(this.collapseNodes(subNodes), function(node) {
            node.index = i;
            i += 1;
            this.push(node);
        }, nodes);

        var newNodes = nodeHelper.getMovingNodes(nodes, null);

        workAreaEvent.wrap(api.nodes.patchBulk(workAreaId, newNodes));
    };

}]);

'use strict';

angular.module('navotron.nodeTree', [
    'navotron.api',
    'navotron.modifyField',
    'navotron.nodeHelper',
    'navotron.workArea',
    'ui.tree',
])

.controller('nodeTreeController', ["nodeHelper", "nodeTreeFactory", "nodeTreeEvent", function(nodeHelper, nodeTreeFactory, nodeTreeEvent) {
    this.nodeHelper = nodeHelper;
    this.nodeTreeFactory = nodeTreeFactory;
    this.nodeTreeEvent = nodeTreeEvent;
}])

.directive('nodeTree', ["nodeHelper", "nodeTreeEvent", function(nodeHelper, nodeTreeEvent) {
    return {
        restrict: 'E',
        transclude: true,
        require: ['^nodeArea', '^workArea'],
        templateUrl: 'js/components/workArea/node/nodeArea/nodeTree/nodeTreeView.jade',
        scope: {
            nodes: '=',
            workArea: '=',
        },
        link: function($scope, element, attr, controllers) {
            var nodeAreaCtrl = controllers[0];
            var workAreaCtrl = controllers[1];

            // Node -> Boolean
            // produce true if the node is active
            $scope.setActiveNode = function(node) {
                workAreaCtrl.updateActiveNode(node);
            };

            $scope.patchNode = function(workArea, node, newVal) {
                return nodeHelper.patchNode(workArea.hash_id, node.id, newVal)

                .then(function(node) {
                    $scope.setActiveNode(node);
                });
            };

            // Node -> Boolean
            // hide a node in the nodetree and then remove it from the database
            $scope.deleteNode = function(nodeScope, node) {
                $scope.setActiveNode(false);
                nodeHelper.deleteNodeFromDatabase(nodeScope, nodeHelper.hideNode(node));
            };

            $scope.treeOptions = {

                // Event ->
                // on move event, lock node then save to database
                dropped: function(event) {

                    // If parentnode has changed or position index then update position
                    if ( nodeHelper.changedPosition(event.source, event.dest) ) {

                        // Set constants
                        var sourceNode = event.source.nodeScope.node;
                        var destNodes = event.dest.nodesScope.$modelValue;
                        var destParentNode = nodeHelper.getParentNode(event.dest.nodesScope.node);

                        if ( destParentNode === null ) {
                            nodeAreaCtrl.updateIndexes();
                        }
                        else {
                            // Update the destination nodes indexes
                            nodeHelper.updateIndexes($scope.workArea.hash_id,
                                                     nodeHelper.getMovingNodes(destNodes, destParentNode),
                                                     sourceNode,
                                                     destNodes);
                        }
                    }
                },

                accept: function(sourceNodeScope, destNodesScope, destIndex) {
                    return (destNodesScope.depth() > 0 || destNodesScope.nodes.length <= 0 );
                },

                dragStart: function() {
                    nodeTreeEvent.start();
                },

                dragStop: function() {
                    nodeTreeEvent.stop();
                },

                dragMove: function(e) {
                    var placeholder = angular.element(e.dest.nodesScope.$element[0].getElementsByClassName('angular-ui-tree-placeholder'));
                    placeholder.html('Move page(s) here.');
                },
            };

        },

    };

}])

.service('nodeTreeFactory', ["nodeTreeEvent", "nodeHelper", "workAreaEvent", "api", "notification", function(nodeTreeEvent, nodeHelper, workAreaEvent, api, notification) {

    // Node -> Boolean
    // produce true if the node has children
    this.haveChildren = function(node) {
        return (node.children.length > 0);
    };

    // Boolean Node ->
    // set if show editing buttons for node or not
    this.showEditButtons = function(show, node) {
        if ( !nodeTreeEvent.editing() || !show ) {
            node.showEditButtons = show;
        }
    };

    // Integer String (listof Node) -> Promise
    // produce a new node in the nodetree and save it to the database
    this.addSubNode = function(id, name, lon, workAreaId) {

        // Set parameters
        var node = {
            'name': name + '.' + (lon.length + 1),
            'parentNode': id,
            'lock': true,
            'index': lon.length,
            'workarea': workAreaId
        };

        // Create new node under parent
        var newNode = nodeHelper.newNode(node);

        // Add newNode to the end of the list
        lon.push(newNode);

        // Add node to database
        return workAreaEvent.wrap(api.nodes.post(workAreaId, newNode))

        .then(function(node) {
            lon[lon.length - 1] = node;
            return node;
        })

        .catch(function(reason) {
            lon.splice(lon.length - 1, 1);
            notification.error('Could not create node', reason);
            return reason;
        });
    };

}]);

'use strict';

angular.module('navotron.nodeParent', [])

.controller('nodeParentController', ["nodeTreeFactory", function(nodeTreeFactory) {
    this.nodeTreeFactory = nodeTreeFactory;
}])

.directive('nodeParent', ["nodeHelper", function(nodeHelper) {
    return {
        restrict: 'E',
        require: '^workArea',
        templateUrl: 'js/components/workArea/node/nodeArea/parentNode/parentNode.jade',
        scope: {
            node: '=',
            workArea: '=',
            addSubItem: '&',
        },
        link: function($scope, element, attr, workAreaCtrl) {

            $scope.setActiveNode = function(node) {
                nodeHelper.setActiveNode(node);
                workAreaCtrl.updateActiveNode();
            };

            $scope.patchNode = function(workArea, node, newVal) {
                return nodeHelper.patchNode(workArea.hash_id, node.id, newVal)

                .then(function(node) {
                    $scope.setActiveNode(node);
                });
            };

        }
    };
}]);

'use strict';

angular.module('navotron.nodeHelper', [
    'navotron.workArea',
    'navotron.api',
    'navotron.notification',
])

.factory('nodeTreeEvent', ["$rootScope", function($rootScope) {
    var editing = false;

    $rootScope.$on('nodetree.edit.start', function() {
        editing = true;
    });

    $rootScope.$on('nodetree.edit.stop', function() {
        editing = false;
    });

    return {
        start: function() {
            $rootScope.$emit('nodetree.edit.start');
        },

        stop: function() {
            $rootScope.$emit('nodetree.edit.stop');
        },

        wrap: function(promise) {
            $rootScope.$emit('nodetree.edit.start');
            promise.finally(function() {
                $rootScope.$emit('nodetree.edit.stop');
            });
            return promise;
        },

        editing: function() {
            return editing;
        }
    };
}])

.service('nodeHelper', ["api", "notification", "workAreaEvent", "nodeTreeEvent", "session", function(api, notification, workAreaEvent, nodeTreeEvent, session) {

    // -> Workarea
    // get the active workarea
    this.getActiveNode = function() {
        session.load();
        return session.activeNode;
    };

    // Workarea -> Workarea
    // set active workarea and return it
    this.setActiveNode = function(activeNode) {
        session.set('activeNode', activeNode);
        return activeNode;
    };

    // Node -> Node
    // produce a node with the attribute hidden set to true
    this.hideNode = function(node) {
        node.hidden = true;
        return node;
    };

    // String Integer Node -> Promise
    // delete a node and either remove it or show it again
    this.deleteNodeFromDatabase = function(nodeScope, node) {

        // Delete node
        workAreaEvent.wrap(api.nodes.delete(node.workarea, node.id))

        .then(function(result) {
            nodeScope.remove();
            return true;
        })

        .catch(function(reason) {
            notification.error('Could not remove node', reason);
            node.hidden = false;
            return false;
        });
    };

    // String Integer Boolean listof(Keyword) listof(Node) -> Node
    // produce a node for the nodetree
    this.newNode = function(node) {
        return {
            name: node.name,
            parentNode: typeof node.parentNode !== 'undefined' ? node.parentNode : null,
            children: typeof node.children !== 'undefined' ? node.children : [],
            keywords: typeof node.keywords !== 'undefined' ? node.keywords : [],
            lock: typeof node.lock !== 'undefined' ? node.lock : false,
            index: typeof node.index !== 'undefined' ? node.index : 0,
            workarea: typeof node.workarea !== 'undefined' ? node.workarea : null,
        };
    };

    // Source Dest -> Boolean
    // produce true if parentnode has changed or position index then update position
    this.changedPosition = function(source, dest) {
        return (source.nodesScope.$id !== dest.nodesScope.$id) || (source.index !== dest.index);
    };

    // Node -> Integer or Null
    // produce the id value of a parent node
    this.getParentNode = function(node) {
        if (node === undefined) {
            return null;
        }
        else {
            return node.id;
        }
    };

    // (listof Node) (Integer or Null) -> (listof Node)
    // produce a list of nodes, with new updated indexes.
    this.getMovingNodes = function(destNodes, destParentNode) {
        var nodes = [];
        var index = 1;

        angular.forEach(destNodes, function(node) {

            this.push({
                'id': node.id,
                'index': index,
                'parentNode': destParentNode
            });

            index += 1;

        }, nodes);

        return nodes;
    };

    // (listof Node) Boolean -> (listof NodeScope)
    // produce a list of nodes with updated lock attribute
    this.lockNode = function(nodes, lock) {
        angular.forEach(nodes, function(node) {
            node.lock = lock;
        });

        return nodes;
    };

    // String (listof Node) Node (listof NodeScope)  ->
    // lock the nodes and then update the
    this.updateIndexes = function(workAreaId, nodes, sourceNode, destNodes) {

        // Lock node before change
        var lockNode = this.lockNode;
        lockNode(destNodes, true);

        // Update the node
        workAreaEvent.wrap(api.nodes.patchBulk(workAreaId, nodes))

        // Unlock the node and set the new parent for the node
        .then(function(nodes) {
            lockNode(destNodes, false);
            sourceNode.parentNode = nodes.parentNode;
        })

        .catch(function(reason) {
            lockNode(destNodes, false);
            notification.error('Could not move workarea', reason);
        });
    };

    // String Integer NodeParams -> Promise
    // produce the update the given nodes name or go back to the old one
    this.patchNode = function(workAreaId, nodeId, params) {
        return workAreaEvent.wrap(api.nodes.patch(workAreaId, nodeId, params))

        .then(function(nodes) {
            return nodes;
        })

        .catch(function(reason) {
            notification.error('Could not update the node.', reason);
            return reason;
        });
    };

    // Node -> Integer
    // produce the sum of all keywords in a node
    this.sumSearchVolume = function(node) {
        var sum = 0;

        if (node) {
            var keywords = node.keywords;

            angular.forEach(keywords, function(object) {
                sum += object.volume;
            });
        }

        return sum;
    };

}]);

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

.directive("showNode", ["nodeHelper", "showNodeFactory", "keywordHelper", function(nodeHelper, showNodeFactory, keywordHelper) {
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
}])

.service('showNodeFactory', ["$modal", "$stateParams", "workAreaEvent", "api", "keywordHelper", function($modal, $stateParams, workAreaEvent, api, keywordHelper) {
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

}]);

'use strict';

angular.module('navotron.addKeywords', ['navotron.api'])

.controller('addKeywords', ["$scope", "$modalInstance", "createKeywords", "workAreaId", "nodeId", "workAreaEvent", "api", function($scope, $modalInstance, createKeywords, workAreaId, nodeId, workAreaEvent, api) {
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
}])

.factory('createKeywords', ["$filter", function($filter) {

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

}]);

'use strict';

angular.module('navotron.updateKeywords', ['navotron.api'])

.controller('updateKeywords', ["$scope", "$modalInstance", "workAreaId", "currentNode", "workAreaEvent", "api", function($scope, $modalInstance, workAreaId, currentNode, workAreaEvent, api) {

    $scope.updateCurrentKeywords = function() {
        $scope.updateChoice = 'current';
        $scope.keywords = currentNode.keywords;
    };

    $scope.updateAllKeywords = function() {
        $scope.updateChoice = 'all';

        workAreaEvent.wrap(api.keywords.get(workAreaId))

        .then(function(keywords) {
            $scope.keywords = keywords;
        });
    };

    $scope.updateKeywordVolume = function() {
        workAreaEvent.wrap(api.keywords.updateVolume(workAreaId))
        .then($scope.updateAllKeywords);
    };

    $scope.isCurrentUpdateChoice = function(updateChoice) {
        return (updateChoice === $scope.updateChoice);
    };

    $scope.add = function() {
        $modalInstance.close('result');
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.updateCurrentKeywords();
}]);

'use strict';

angular.module('navotron.preview', [
    'navotron.previewPage',
    'navotron.previewHelp',
])

.directive('preview', ["api", "session", function(api, session) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/preview/preview.jade',
        scope: {
            nodes: '='
        },
        controller: ["$scope", function($scope) {
            this.setHelpSection = function(helpSection) {
                $scope.helpSection = helpSection;
            };
        }]
    };
}]);

'use strict';

angular.module('navotron.previewHelp', [])

.directive('helpText', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewHelp/previewHelp.jade',
        scope: {
            helpSection: '='
        },
    };
});

'use strict';

angular.module('navotron.previewPage', ['navotron.previewText'])

.directive('previewPage', function() {
    return {
        restrict: 'E',
        require: '^workArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewPage/previewPage.jade',
        scope: {
            nodes: '='
        },
        link: function(scope, elem, attrs, workAreaCtrl) {

            scope.setActiveNode = function(node) {
                scope.activeNode = node;
                workAreaCtrl.updateActiveNode(node);
            };

            scope.toggle = function(node) {
                node.active = !node.active;
            };

            scope.setParent = function(node) {
                scope.parentNode = node;
                scope.childNodes = node.children;
            };

            if ( scope.nodes.length > 0 ) {
                scope.setActiveNode(scope.nodes[0]);
                scope.setParent(scope.nodes[0]);
            }

        }
    };
});

'use strict';

angular.module('navotron.previewText', [])

.directive('previewText', function() {
    return {
        restrict: 'E',
        require: '^preview',
        templateUrl: 'js/components/workArea/preview/previewText/previewText.jade',
        scope: {
            node: '=',
        },
        link: function(scope, element, attr, previewCtrl) {
            scope.previewCtrl = previewCtrl;
        },
    };
})

.directive('previewArea', function() {
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true,
        scope: {},
        replace: true,
        controller: ["$scope", function($scope) {
            var self = this;

            this.showHelp = function() {
                self.textColor = {color: 'red'};
            };

            this.hideHelp = function() {
                self.textColor = {color: 'auto'};
            };
        }],
    };
})

.directive('previewSection', function() {
    return {
        restrict: 'EA',
        require: '^previewArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewText/previewSection.jade',
        scope: {},
        replace: true,
        link: function(scope, element, attrs, previewAreaCtrl) {
            scope.previewAreaCtrl = previewAreaCtrl;
        },
    };
})

.directive('previewQuestion', function() {
    return {
        restrict: 'EA',
        require: '^previewArea',
        transclude: true,
        templateUrl: 'js/components/workArea/preview/previewText/previewQuestion.jade',
        scope: {},
        replace: true,
        link: function(scope, element, attrs, previewAreaCtrl) {
            scope.previewAreaCtrl = previewAreaCtrl;
        },
    };
});

'use strict';

angular.module('navotron.resolver', [])

.factory('workAreaResolver', ["$state", "workAreaHelper", "nodeHelper", "api", function($state, workAreaHelper, nodeHelper, api) {

    var currentWorkArea = function(workAreaId) {
        if ( workAreaId !== "" ) {
            return api.workareas.getOne(workAreaId)
            .then(function(workarea) {
                workAreaHelper.setActiveWorkarea(workarea);
                return workarea;
            });
        }
        else {
            return workAreaHelper.createWorkarea('http://www.new-workarea.se')

            .then(function(workArea) {
                api.nodes.post(workArea.hash_id, nodeHelper.newNode({ name: 'Home', workarea: workArea.hash_id }))

                .then(function(node) {
                    $state.go('root.workArea.navigation', {
                        workAreaId: workArea.hash_id
                    });

                    return workArea;
                });

            });
        }
    };

    return currentWorkArea;
}])

.factory('nodeResolver', ["$stateParams", "api", function($stateParams, api) {

    var currentNodes = function(workAreaId) {
        if ( workAreaId !== "" ) {
            return api.nodes.getNested(workAreaId);
        }

        return [];
    };

    return currentNodes;
}]);

'use strict';

angular.module('navotron.workAreaSettings', [])

.controller('settingsController', ["formFactory", "settingsFactory", function(formFactory, settingsFactory) {
    this.formFactory = formFactory;
    this.settingsFactory = settingsFactory;
    this.settingsFactory.getWorkarea();
}])

.directive("workAreaSettings", function() {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/settings/settingsView.jade',
    };
})

.service('formFactory', function() {
    var self = this;
    self.trySubmitted = false;

    self.fieldError = function(field) {
        return (field.$invalid && (!field.$pristine || self.trySubmitted));
    };

    self.fieldRequired = function(field) {
        return (field.$error.required && (!field.$pristine || self.trySubmitted));
    };

    self.fieldErrorOrRequired = function(field) {
        return (self.fieldError(field) || self.fieldRequired(field));
    };
})

.service('settingsFactory', ["session", "api", "notification", "workAreaHelper", function(session, api, notification, workAreaHelper) {
    var self = this;
    self.workArea = undefined;

    self.getWorkarea = function() {
        if ( self.showSettings() ) {
            api.workareas.getOne(session.activeWorkArea.hash_id)
            .then(function(workarea) {
                self.workArea = workarea;
            });
        }
    };

    self.showSettings = function() {
        return session.hasSetProperty('activeWorkArea');
    };

    self.saveWorkarea = function() {
        if ( self.workArea !== undefined ) {
            api.workareas.put(session.activeWorkArea.hash_id, self.workArea)
            .then(function(workarea) {
                self.workArea = workAreaHelper.setActiveWorkarea(workarea);
                notification.success('All changes saved');
            })

            .catch(function(reason) {
                notification.error('All changes saved', reason);
            });
        }
    };
}]);

'use strict';

angular.module('navotron.workArea', [
    'navotron.api',
    'navotron.controlPanel',
    'navotron.keywords',
    'navotron.nodeArea',
    'navotron.preview',
    'navotron.showNode',
])

.directive('workArea', ["nodeHelper", function(nodeHelper) {
    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/workAreaView.jade',
        scope: {},
        controller: ["$scope", "$state", function($scope, $state) {
            $scope.state = $state;

            this.updateActiveNode = function(node) {
                nodeHelper.setActiveNode(node);
                $scope.activeNode = node;
            };
        }]
    };
}])

.factory('workAreaEvent', ["$rootScope", function($rootScope) {
    var editing = false;

    $rootScope.$on('nodetree.http.start', function() {
        editing = true;
    });

    $rootScope.$on('nodetree.http.stop', function() {
        editing = false;
    });

    return {
        wrap: function(promise) {
            $rootScope.$emit('nodetree.http.start');
            promise.finally(function() {
                $rootScope.$emit('nodetree.http.stop');
            });
            return promise;
        },

        editing: function() {
            return editing;
        }
    };
}])

.service('workAreaHelper', ["$timeout", "session", "api", "workAreaEvent", "notification", function($timeout, session, api, workAreaEvent, notification) {

    // WorkareaParams -> Workarea
    // produce a workarea
    this.newWorkArea = function(params) {
        return {
            site_url: params.siteUrl,
            owner: typeof params.owner !== 'undefined' ? params.owner : null,
            nodes: typeof params.nodes !== 'undefined' ? params.nodes : [],
            keywords: typeof params.keywords !== 'undefined' ? params.keywords : [],
        };
    };

    // String String -> Promise
    // produce a new workarea and then reload the current view with it.
    this.createWorkarea = function(siteUrl) {

        var newWorkArea = this.newWorkArea({
            siteUrl: siteUrl,
            owner: session.user.id,
        });

        // Load or create workarea
        return workAreaEvent.wrap(api.workareas.post(newWorkArea))

        .catch(function(reason) {
            notification.error('Could not create workarea', reason);
        });
    };

    // String WorkAreaParams -> Promise
    // produce the update the given workarea
    this.patchWorkarea = function(workAreaId, params) {
        return workAreaEvent.wrap(api.workareas.patch(workAreaId, params))

        .catch(function(reason) {
            notification.error('Could not update the workarea.', reason);
            return reason;
        });
    };

    // Workarea Integer -> Promise
    // produce a promise with a comfirmation that the workarea was removed
    this.delete = function(workarea, index) {
        var self = this;

        $timeout(function() {
            workarea.deleting = true;
        }, 500);

        return api.workareas.delete(workarea.hash_id)
        .then(function(result) {
            if (workarea.hash_id === self.getActiveWorkarea().hash_id) {
                self.setActiveWorkarea(undefined);
            }

            return result;
        });
    };

    // -> Workarea
    // get the active workarea
    this.getActiveWorkarea = function() {
        session.load();
        return session.activeWorkArea;
    };

    // Workarea -> Workarea
    // set active workarea and return it
    this.setActiveWorkarea = function(activeWorkArea) {
        session.set('activeWorkArea', activeWorkArea);
        return activeWorkArea;
    };

}]);

'use strict';

angular.module('navotron.workAreaList', ['navotron.api'])

.directive("workAreaList", ["workAreaHelper", "api", function(workAreaHelper, api) {

    return {
        restrict: 'E',
        templateUrl: 'js/components/workArea/workAreaListView.jade',
        controller: ["$scope", function($scope) {
            api.workareas.get().then(function(workareas) {
                $scope.workareas = workareas;
            });

            $scope.delete = function(workarea, index) {
                workAreaHelper.delete(workarea, index)
                .then(function(result) {
                    $scope.workareas.splice(index, 1);
                });
            };

        }]
    };

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
