'use strict';

angular.module('app.topic', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/topic/:topic', {
    templateUrl: 'src/views/topic.html'
  , controller: 'TopicController'
  })
  $routeProvider.when('/topic/:topic/:topic2', {
    templateUrl: 'src/views/topic.html'
  , controller: 'TopicController'
  })
})

.controller('TopicController', function(
	$scope,
	$location,
	$translate,
	$translatePartialLoader,
	$timeout,
	$mdColors,
	columnMeasures,
	$routeParams,
	topicsService
) {

  $translatePartialLoader.addPart('topic')
  $translate.refresh()

  $scope.topicsLoaded = false
	$scope.topics
	$scope.topicsIndex
  $scope.topic
  $scope.topic2
  $scope.crossing

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentityExpanded = 0
	$scope.flexColMapWe = 0
	$scope.flexColVerbatim = 0
	$scope.flexColTopic = columnMeasures.topic.topic
	$scope.flexColSide = columnMeasures.topic.side

	$scope.widthLeftHandle = 0

  $scope.transition = function(destination, settings) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'verbatim':
  			$scope.transitioning = true
				$timeout(function(){ $location.path('/webentity') }, transitionTime)
  			break
  		case 'topics':
  			$scope.transitioning = true
				$timeout(function(){ $location.path('/topics') }, transitionTime)
  			break
      case 'search':
        $scope.transitioning = true
        if (settings && settings.topicsOverlap) {
          $timeout(function(){ $location.path('/search/'+encodeURIComponent($scope.topic + ':true AND ' + $scope.topic2 + ':true')) }, transitionTime)
        } else {
          $timeout(function(){ $location.path('/') }, transitionTime)
        }
        break
  	}
  }

  $scope.allTopics = function() {
    $timeout(function(){ $location.path('/topics') })
  }

  $scope.compareTo = function(t2) {
  	$timeout(function(){ $location.path('/topic/'+$scope.topic+'/'+t2) })
  }

  $scope.closeTop = function() {
  	$timeout(function(){ $location.path('/topic/'+$scope.topic2) })
  }

  $scope.closeBottom = function() {
  	$timeout(function(){ $location.path('/topic/'+$scope.topic) })
  }

  init()

  function init() {
  	$scope.topic = $routeParams.topic

  	topicsService.get(function(topics){
      $scope.topics = topics
      $scope.otherTopics = topics.filter(function(t){return t.id != $scope.topic})
      $scope.topicsLoaded = true

      topicsService.getIndex(function(index){
        $scope.topicsIndex = index

		  	if ($routeParams.topic2 && $routeParams.topic2 != '' && $routeParams.topic2 != 'undefined') {
		  		$scope.topic2 = $routeParams.topic2
		  		$scope.crossing = [$scope.topic, $scope.topic2, $scope.topicsIndex[$scope.topic][$scope.topic2]]
		  	}

      })
    })
  }

})