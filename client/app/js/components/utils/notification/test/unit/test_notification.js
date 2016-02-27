'use strict';

/* jasmine specs for services go here */

describe('notification', function() {
    var notification;

    beforeEach(module('navotron.notification', 'navotron.templates'));

    beforeEach(inject(function(_notification_) {
        notification = _notification_;
    }));

    it('Add message with alert-info class', function() {
        notification.info('My message');

        expect(notification.messages).toEqual([{
            message: 'My message',
            alertClass: 'alert-info',
        }]);
    });

    it('Add message with alert-success class', function() {
        notification.success('My message');

        expect(notification.messages).toEqual([{
            message: 'My message',
            alertClass: 'alert-success',
        }]);
    });

    it('Add message with alert-error class', function() {
        notification.error('My message', {status: 200, statusText: 'Error'});

        expect(notification.messages).toEqual([{
            message: 'My message Status: 200 ErrorMsg: Error',
            alertClass: 'alert-danger',
        }]);
    });

    it('Messages get removed after a certain time', inject(function($timeout) {
        notification.info('My message');
        expect(notification.messages.length).toBe(1);
        $timeout.flush();
        expect(notification.messages.length).toBe(0);
    }));

    it('Should show messages in the notification element', inject(function($rootScope, $compile) {
        var element = $compile("<nt-notification></nt-notification>")($rootScope);
        $rootScope.$digest();
        expect(element[0].getElementsByClassName('alert').length).toBe(0);

        notification.info('My message');
        $rootScope.$digest();
        expect(element[0].getElementsByClassName('alert').length).toBe(1);
    }));

});
