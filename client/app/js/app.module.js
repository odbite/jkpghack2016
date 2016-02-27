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
