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
