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

  $scope.webentities = []
  for (var i=0; i<10000; i++) {
  	$scope.webentities.push(createDummyWe())
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

  // Dummy web entity generation for the demo
	function createDummyWe() {
		var we = {}
		var seed = Math.random()
		we.id = (''+seed).replace(/\./, '-')
		we.name = (''+seed).replace('0.', 'Hodor ')
			.replace(/[0123]/gi, ' ')
			.replace(/4/gi, 'p')
			.replace(/5/gi, 'o')
			.replace(/6/gi, 'n')
			.replace(/7/gi, 'e')
			.replace(/8/gi, 'y')
			.replace(/9/gi, 'g')
		return we
	}

})