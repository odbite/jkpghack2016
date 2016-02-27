'use strict';

angular.module('navotron.config', [
    'navotron.notification',
])

.config(function($httpProvider, notificationProvider, oauth2Provider) {

    // Do not cache http calls
    $httpProvider.defaults.cache = false;

    // Show notifications for 5 seconds
    notificationProvider.setTimeout(8000);

    // Configurations for the oauth2 provider
    oauth2Provider.setClientDetails({
        url: '/oauth2/token/',
        clientId: 'qT.pfokMO=1X.j6Pz4jB4L-.P_S1O9abTiFoqPj9',
        clientSecret: 'YeFV?UweZ6P!oeVFFIPN5NkicXB8tHFh@PC0ACZF@htyF4gxcb8iDd?VC2;E3bpkP_.ApQob!JtwolA0FJDc-DBzAHDZ8?dnmCMsMc1qTM8TcB!0C!.q?TYjpswEo2MX',
    });
});
