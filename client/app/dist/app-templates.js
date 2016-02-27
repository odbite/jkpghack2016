angular.module('navotron.templates', ['js/components/knowme/knowme.jade', 'js/components/navbar/navbar.jade', 'js/components/utils/modifyField/modifyFieldView.jade', 'js/components/utils/notification/notification.jade', 'js/main.jade']);

angular.module("js/components/knowme/knowme.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/components/knowme/knowme.jade",
    "<ui-gmap-google-map center=\"map.center\" zoom=\"map.zoom\"></ui-gmap-google-map>");
}]);

angular.module("js/components/navbar/navbar.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/components/navbar/navbar.jade",
    "<nav role=\"navigation\" style=\"padding-top: 7px; height: 59px\" class=\"navbar navbar-default navbar-custom\"><div ng-controller=\"navbarController as ctrl\" class=\"container-fluid\"><div class=\"navbar-header col-md-12 text-center\"><a ui-sref=\"root\" style=\"font-size: 30px\"><span style=\"color: #56AAF4\">Have</span><span style=\"color: #00B500; margin: 4px\">you</span><span style=\"color: #56AAF4\">met</span><span style=\"color: #00B500; margin: 4px\">me</span></a></div></div></nav>");
}]);

angular.module("js/components/utils/modifyField/modifyFieldView.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/components/utils/modifyField/modifyFieldView.jade",
    "<span ng-hide=\"editField\" ng-click=\"edit()\">{{ field }}</span> <input type=\"{{ type }}\" ng-show=\"editField\" ng-model=\"newValue\" ng-blur=\"onBlur()\" to-select=\"editField\" on-blur=\"save()\" on-enter-press=\"save()\" class=\"form-control input-sm\">");
}]);

angular.module("js/components/utils/notification/notification.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/components/utils/notification/notification.jade",
    "<div class=\"notification-container\"><div ng-repeat=\"alert in messages\" ng-class=\"alert.alertClass\" ng-show=\"$index === 0\" class=\"alert\">{{ alert.message }} <button type=\"button\" ng-click=\"messages.splice($index, 1)\" class=\"close\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span></button></div></div>");
}]);

angular.module("js/main.jade", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("js/main.jade",
    "<div ui-view=\"header\"></div><div ui-view=\"main\"></div><div ui-view=\"footer\"></div>");
}]);
