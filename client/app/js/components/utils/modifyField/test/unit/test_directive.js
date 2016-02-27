'use strict';


describe('modifyField', function() {
    var modifyFieldFactory;

    beforeEach(module('navotron.modifyField', 'navotron.templates'));

    beforeEach(inject( function(_modifyFieldFactory_) {
        modifyFieldFactory = _modifyFieldFactory_;
    }));

    it('should execute the on save function because of a new value', function() {

        var fn = function(obj) {
            return obj.newVal;
        };

        expect(modifyFieldFactory.save('newVal', 'oldVal', fn)).toBe('newVal');
        expect(modifyFieldFactory.save(1, 2, fn)).toBe(1);
        expect(modifyFieldFactory.save({name: 'newVal'}, {name: 'oldVal'}, fn)).toEqual({name: 'newVal'});
    });

    it('should return true because newValue is new', function() {
        expect(modifyFieldFactory.isNewValue('newVal', 'oldVal')).toBe(true);
        expect(modifyFieldFactory.isNewValue(1, 2)).toBe(true);
        expect(modifyFieldFactory.isNewValue({name: 'newVal'}, {name: 'oldVal'})).toEqual(true);
    });

    it('should return false because newValue is equal to oldValue', function() {
        expect(modifyFieldFactory.isNewValue('oldVal', 'oldVal')).toBe(false);
        expect(modifyFieldFactory.isNewValue(1, 1)).toBe(false);
        expect(modifyFieldFactory.isNewValue({name: 'oldVal'}, {name: 'oldVal'})).toEqual(false);
    });
});
