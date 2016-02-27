'use strict';

describe('serviceSpec', function() {

    beforeEach(module('navotron.api'));

    describe('nodes', function() {
        var $httpBackend, nodes, scope;

        beforeEach(inject(function($injector, $rootScope) {

            // Set up the mock http api responses
            $httpBackend = $injector.get('$httpBackend');

            // Get the target api for the mock respons
            nodes = $injector.get('nodes');

            scope = $rootScope;

        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('can get an instance of my factory', inject(function(nodes) {
            expect(nodes).toBeDefined();
        }));

    });

    describe('workarea', function() {
        var $httpBackend, workareas;

        beforeEach(inject(function($injector) {

            // Set up the mock http api responses
            $httpBackend = $injector.get('$httpBackend');

            // Get the target api for the mock respons
            workareas = $injector.get('workareas');

        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('can get an instance of my factory', inject(function(workareas) {
            expect(workareas).toBeDefined();
        }));

    });

});
