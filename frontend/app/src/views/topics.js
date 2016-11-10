'use strict';

angular.module('app.topics', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/topics', {
    templateUrl: 'src/views/topics.html'
  , controller: 'TopicsController'
  })
})

.controller('TopicsController', function(
  $scope,
  $location,
  $translate,
  $translatePartialLoader,
  $timeout,
  solrEndpoint,
  columnMeasures,
  topicsService
) {

  $translatePartialLoader.addPart('topics')
  $translate.refresh()

  // Columns dynamic width
	$scope.transitioning = false
	$scope.flexColMap = 0
	$scope.flexColSearch = 0
	$scope.flexColTopics = columnMeasures.topics.topics
	$scope.flexColSide = columnMeasures.topics.side
	$scope.widthLeftHandle = columnMeasures.handle
	$scope.widthRightHandle = 0

  $scope.topics = []
  $scope.topicsLoaded = false

  $scope.transition = function(destination) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'search':
  			$scope.transitioning = true
  			$scope.flexColMap = columnMeasures.search.map
				$scope.flexColSearch = columnMeasures.search.search
				$scope.flexColTopics = columnMeasures.search.topics
				$scope.flexColSide = 0
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/') }, transitionTime)
  			break
  	}
  }

  init()

  function init() {
    topicsService.get(function(topics){
      $scope.topics = topics
      $scope.topicsLoaded = true
    })
  }

})