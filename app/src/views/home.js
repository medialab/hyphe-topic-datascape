'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
})

.controller('HomeController', function($scope, $location, $translate, $translatePartialLoader) {
  $translatePartialLoader.addPart('home');
  $translate.refresh();
});