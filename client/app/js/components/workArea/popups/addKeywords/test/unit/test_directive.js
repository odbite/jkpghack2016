'use strict';

/* jasmine specs for services go here */

describe('showNode', function() {
    var createKeywords,
        $filter;

    beforeEach(module('navotron.addKeywords', 'navotron.templates', 'navotron.datadef'));

    beforeEach(inject( function(_$filter_, _createKeywords_, datadef) {
        $filter = _$filter_;
        createKeywords = _createKeywords_;
    }));

    it('Skip empty keywords', function() {
        var keys = [
            'first',
            '',
            'second',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(2);

        expect(result[0].keyword).toEqual('first');
        expect(result[1].keyword).toEqual('second');
    });

    it('Have default volume to 0', function() {
        var keys = [
            'first',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(1);
        expect(result[0].keyword).toEqual('first');
    });

    it('Remove duplicate keywords', function() {
        var keys = [
            'first',
            'second',
            'first'
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(2);
        expect(result[0].keyword).toEqual('first');
        expect(result[1].keyword).toEqual('second');
    });

    it('Have timestamp and country defined', function() {
        var keys = [
            'first',
            'second',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(2);

        expect(result[0].timestamp).toBeDefined();
        expect(result[1].timestamp).toBeDefined();
    });

    it('Volume should be a number', function() {
        var keys = [
            'first',
            'second',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(2);
        expect(result[0].keyword).toEqual('first');
        expect(result[1].keyword).toEqual('second');
    });

    it('Remove spaces from both sides of the keyword', function() {
        var keys = [
            ' first',
            'second ',
            ' first ',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(2);
        expect(result[0].keyword).toEqual('first');
        expect(result[1].keyword).toEqual('second');
    });

    it('Volume is a number regardless of spaces', function() {
        var keys = [
            'first',
            'second',
            'third',
        ];
        var result = createKeywords('workareaId', [1], keys);

        expect(result.length).toEqual(3);
        expect(result[0].keyword).toEqual('first');
        expect(result[1].keyword).toEqual('second');
        expect(result[2].keyword).toEqual('third');
    });

});
