'use strict';

/* jasmine specs for services go here */

describe('nodeTree', function() {
    var elm,
        scope,
        compile,
        datadef,
        nodeHelper,
        nodeTreeFactory;

    // Load the myApp module, which contains the directive
    beforeEach(module('navotron.nodeTree', 'navotron.datadef'));

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject( function(_datadef_, _nodeTreeFactory_) {
        datadef = _datadef_;
        nodeTreeFactory = _nodeTreeFactory_;
    }));

    it('should add new subitem to the nodetree', inject(function(nodes, $q) {

        // Add mock response from server
        spyOn(nodes, "post").and.callFake(function() {
            var deferred = $q.defer();

            var response = {
                id: 123,
                children: [],
                keyword: [],
                name: "Home",
                parentNode: null,
                workarea: "1"
            };

            deferred.resolve(response);
            return deferred.promise;
        });

        var lon = [];

        nodeTreeFactory.addSubNode('1', 'Home', lon, '2');
        nodeTreeFactory.addSubNode('1', 'Home', lon, '2');

        expect(lon.length).toBe(2);

        expect(lon[0].name).toBe('Home.1');
        expect(lon[0].index).toBe(0);

        expect(lon[1].name).toBe('Home.2');
        expect(lon[1].index).toBe(1);

    }));

});
