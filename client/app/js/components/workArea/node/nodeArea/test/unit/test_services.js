'use strict';

/* jasmine specs for services go here */

describe('nodeArea', function() {
    var nodeAreaFactory,
        datadef;

    // Load the myApp module, which contains the directive
    beforeEach(module('navotron.nodeArea', 'navotron.datadef'));

    beforeEach(inject( function(_nodeAreaFactory_, _datadef_) {
        nodeAreaFactory = _nodeAreaFactory_;
        datadef = _datadef_;
    }));

    it('one empty list should return one empty list', function() {
        var result = nodeAreaFactory.collapseNodes([]);
        expect(result).toEqual([]);
    });

    it('two empty lists should return one empty list', function() {
        var result = nodeAreaFactory.collapseNodes([], []);
        expect(result).toEqual([]);
    });

    it('should produce one list with a node in it', function() {
        var data = [[datadef.N1]];

        var result = nodeAreaFactory.collapseNodes(data);
        expect(result).toEqual([datadef.N1]);
    });

    it('should remove the empty arrays', function() {
        var data = [[], [datadef.N1], []];

        var result = nodeAreaFactory.collapseNodes(data);
        expect(result).toEqual([datadef.N1]);
    });

    it('should produce a list with two nodes', function() {
        var data = [[], [datadef.N1, datadef.N2], [datadef.N5]];

        var result = nodeAreaFactory.collapseNodes(data);
        expect(result).toEqual([datadef.N1, datadef.N2, datadef.N5]);
    });
});
