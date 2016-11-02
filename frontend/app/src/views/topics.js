'use strict';

angular.module('app.topics', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/topics', {
    templateUrl: 'src/views/topics.html'
  , controller: 'TopicsController'
  })
})

.controller('TopicsController', function($scope, $location, $translate, $translatePartialLoader, $timeout, solrEndpoint) {

  $translatePartialLoader.addPart('topics')
  $translate.refresh()

  init()

  function init() {
  }

})