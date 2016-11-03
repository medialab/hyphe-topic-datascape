'use strict';

angular.module('app.topic', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/topic', {
    templateUrl: 'src/views/topic.html'
  , controller: 'TopicController'
  })
})

.controller('TopicController', function($scope, $location, $translate, $translatePartialLoader, $timeout, $mdColors, solrEndpoint, columnMeasures) {

  $translatePartialLoader.addPart('topic')
  $translate.refresh()

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentityExpanded = 0
	$scope.flexColMapWe = 0
	$scope.flexColVerbatim = 0
	$scope.flexColTopic = columnMeasures.topic.topic

	$scope.widthLeftHandle = 0

  $scope.transition = function(destination) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'verbatim':
  			$scope.transitioning = true
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