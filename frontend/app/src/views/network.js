'use strict';

angular.module('app.network', ['ngRoute', 'ngMaterial'])

.config(function($routeProvider) {
  $routeProvider.when('/network', {
    templateUrl: 'src/views/network.html'
  , controller: 'NetworkController'
  })
})

.controller('NetworkController', function(
  $scope,
  $location,
  $window,
  $translate,
  $translatePartialLoader,
  $timeout,
  $mdColors,
  solrEndpoint,
  columnMeasures,
  topics,
  $routeParams,
  persistance,
  datascapeTitle,
  datascapeLogos
) {

  sigma.parsers.gexf('data/network.gexf', {
    container: 'sigma-container',
    settings: {
      defaultNodeColor: '#999999',
      defaultEdgeColor: '#DDDDDD'
    }
  });
})
