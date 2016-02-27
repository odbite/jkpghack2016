'use strict';

describe('token refresh', function() {
    var oauthResponse;

    beforeEach(module('navotron.authService', 'navotron.config'));

    beforeEach(inject(function(oauth2, tokens, $httpBackend) {
        $httpBackend.whenGET('/someList').respond(200);

        oauthResponse = $httpBackend.whenPOST('/oauth2/token/');

        oauthResponse.respond(200, {
            'access_token': 'a',
            'expires_in': 36000,
            'refresh_token': 'b'
        });

        oauth2.login('user', 'password');
        $httpBackend.flush();

        expect(tokens.accessToken).toBe('a');
        expect(tokens.refreshToken).toBe('b');

        // Set the next response if the expiryDate has passed
        oauthResponse.respond(200, {
            'access_token': 'c',
            'expires_in': 36000,
            'refresh_token': 'd'
        });
    }));

    it('Should refresh the expired token automatically', inject(function(tokens, $httpBackend, $http) {
        var now = Date.now();
        spyOn(Date, 'now').and.callFake(function() {
            return now + 36000*1000;
        });

        $http.get('/someList');
        $httpBackend.flush();

        // Did refresh the tokens
        expect(tokens.accessToken).toBe('c');
        expect(tokens.refreshToken).toBe('d');

    }));

    it('Should refresh not refresh if the token isn\'t expired', inject(function(tokens, $httpBackend, $http) {

        $http.get('/someList');
        $httpBackend.flush();

        // Didn't refresh yet
        expect(tokens.accessToken).toBe('a');
        expect(tokens.refreshToken).toBe('b');

    }));

});
