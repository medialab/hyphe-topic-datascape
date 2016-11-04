'use strict';

angular.module('app.webentities', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/webentities', {
    templateUrl: 'src/views/webentities.html'
  , controller: 'WebentitiesController'
  })
})

.controller('WebentitiesController', function(
	$scope,
	$location,
	$translate,
	$translatePartialLoader,
	$timeout,
	solrEndpoint,
	columnMeasures,
	webentitiesService
) {

  $translatePartialLoader.addPart('webentities')
  $translate.refresh()

  $scope.webentities = []
  $scope.webentitiesLoaded = false

  // Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentities = columnMeasures.wes.wes
	$scope.flexColMap = columnMeasures.wes.map
	$scope.flexColSearch = 0
	$scope.flexColTopics = 0
	$scope.widthLeftHandle = 0
	$scope.widthRightHandle = columnMeasures.handle

  $scope.transition = function(destination, settings) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'search':
  			$scope.transitioning = true
  			$scope.flexColWebentities = 0
  			$scope.flexColMap = columnMeasures.search.map
				$scope.flexColSearch = columnMeasures.search.search
				$scope.flexColTopics = columnMeasures.search.topics
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/') }, transitionTime)
  			break
  		case 'webentity':
  			$scope.transitioning = true
  			$scope.flexColWebentities = columnMeasures.we.we
  			$scope.flexColMap = columnMeasures.we.mapdocs
				$scope.widthLeftHandle = 0
				$scope.widthRightHandle = 0
				$timeout(function(){ $location.path('/webentity/'+settings.webentity) }, transitionTime)
  			break
  	}
  }

  init()

  function init() {
  	webentitiesService.get(function(wes){
  		console.log(wes[0])
  		$scope.webentities = wes
  		$scope.webentitiesLoaded = true
  	})
  }

})