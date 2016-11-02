'use strict';

angular.module('app.webentities', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/webentities', {
    templateUrl: 'src/views/webentities.html'
  , controller: 'WebentitiesController'
  })
})

.controller('WebentitiesController', function($scope, $location, $translate, $translatePartialLoader, $timeout, solrEndpoint, columnMeasures) {

  $translatePartialLoader.addPart('webentities')
  $translate.refresh()

  // Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentities = columnMeasures.we.we
	$scope.flexColMap = columnMeasures.we.map
	$scope.flexColSearch = 0
	$scope.flexColTopics = 0
	$scope.widthLeftHandle = 0
	$scope.widthRightHandle = columnMeasures.handle

  $scope.transition = function(destination) {
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
  	}
  }

  init()

  function init() {
  	/*sigma.parsers.gexf(
    	'data/network.gexf',
	    {
	      container: 'sigmaContainer',
	      settings: {
	      	drawNodes: false,
	      	drawEdges: false,
	      	labelThreshold: Infinity
	      }
	    },
	    function(s) {
	      // This function will be executed when the
	      // graph is displayed, with "s" the related
	      // sigma instance.
	    }
	  )*/
  }

})