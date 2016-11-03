'use strict';

angular.module('app.verbatim', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/verbatim', {
    templateUrl: 'src/views/verbatim.html'
  , controller: 'VerbatimController'
  })
})

.controller('VerbatimController', function($scope, $location, $translate, $translatePartialLoader, $timeout, $mdColors, solrEndpoint, columnMeasures) {

  $translatePartialLoader.addPart('verbatim')
  $translate.refresh()

	$scope.topics = ['dummy', 'topic', 'list']

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentityExpanded = 0
	$scope.flexColMapWe = columnMeasures.verbatim.mapwe
	$scope.flexColMap = columnMeasures.verbatim.map
	$scope.flexColVerbatim = columnMeasures.verbatim.verbatim
	$scope.flexColTopics = columnMeasures.verbatim.topics
	$scope.widthLeftHandle = columnMeasures.handle

  $scope.transition = function(destination) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'webentity':
  			$scope.transitioning = true
  			$scope.flexColWebentityExpanded = columnMeasures.we.we
				$scope.flexColMapWe = columnMeasures.we.mapdocs
				$scope.flexColMap = columnMeasures.we.map
				$scope.flexColVerbatim = 0
				$scope.flexColTopics = 0
				$scope.widthLeftHandle = 0
				$timeout(function(){ $location.path('/webentity') }, transitionTime)
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