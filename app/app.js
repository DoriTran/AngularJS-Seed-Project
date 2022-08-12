'use strict';

angular.module('app', [
  // Main
  'ui.router',

  // Addon
  'ngCookies',
  'LocalStorageModule',
  'ui.bootstrap',
  'angular-md5',
  'chart.js'
])
.config(function ($httpProvider) {
  var interceptor = function($location, $log, $q) {
      function error(response) {
          if (response.status === 401) {
              $log.error('You are unauthorised to access the requested resource (401)');
          } else if (response.status === 404) {
              $log.error('The requested resource could not be found (404)');
          } else if (response.status === 500) {
              $log.error('Internal server error (500)');
          }
          return $q.reject(response);
      }
      function success(response) {
          //Request completed successfully
          return response;
      }
      return function(promise) {
          return promise.then(success, error);
      }
  };
  $httpProvider.interceptors.push(interceptor);
})
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('employee', {
      url: "/employee",
      template: '<div>Employee Page</div>'
    })
    .state('team', {
      url: "/team",
      template: '<div>Team Page</div>'
    })
    .state('profile', {
      url: "/profile",
      template: '<div>Profile Page</div>'
    })
  $urlRouterProvider.otherwise("/employee");
})

