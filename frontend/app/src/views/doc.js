'use strict';

angular.module('app.doc', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/doc/:target', {
    templateUrl: 'src/views/doc.html'
  , controller: 'DocController'
  })
})

.controller('DocController', function(
	$scope,
	$location,
  $routeParams
) {

  $scope.target = 'doc/' + $routeParams.target + '.md'
  
})