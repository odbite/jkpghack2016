'use strict';

angular.module('navotron.cache', [])

.service('cache', function($cacheFactory, session) {

    this.get = function() {
        if ( $cacheFactory.get(session.user.id) === undefined ) {
            return $cacheFactory(session.user.id);
        }
        return $cacheFactory.get(session.user.id);
    };

    this.destroy = function() {
        $cacheFactory.get(session.user.id).removeAll();
    };

});
