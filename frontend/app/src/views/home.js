'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
})

.controller('HomeController', function($scope, $location, $translate, $translatePartialLoader, $timeout, $mdColors, solrEndpoint) {
	var defaultHandleSize = 48

	$scope.searchQuery
	$scope.resultsLoaded = false
	$scope.results
	$scope.resultsHighlighting

	$scope.topics = ['dummy', 'topic', 'list', 'hold the door', 'hold th door', 'hold t door', 'Hol t door', 'Hol door', 'Ho door', 'Hodor', '100', '200', '300', '400', '500', '600', '700']

	// Columns dynamic width
	$scope.flexColWebentities = 0
	$scope.flexColMap = 50
	$scope.flexColSearch = 30
	$scope.flexColTopics = 15
	$scope.widthLeftHandle = defaultHandleSize
	$scope.widthRightHandle = defaultHandleSize

  $scope.transition = function(destination) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'webentities':
  			$scope.flexColMap = 50
  			$scope.flexColWebentities = 50
				$scope.flexColSearch = 0
				$scope.flexColTopics = 0
				$scope.widthLeftHandle = 0
				$scope.widthRightHandle = defaultHandleSize
				$timeout(function(){ $location.path('/webentities') }, transitionTime)
  			break
  		case 'topics':
  			$scope.flexColMap = 0
  			$scope.flexColWebentities = 0
				$scope.flexColSearch = 0
				$scope.flexColTopics = 100
				$timeout(function(){ $location.path('/topics') }, transitionTime)
  			break
  	}
  }

  $scope.execSearchQuery = function() {
  	var query_simple = $scope.searchQuery
  	// var url = solrEndpoint + 'select?q='+encodeURIComponent(query_simple)+'&rows=0&fl=url+web_entity_id&wt=json&indent=true&facet=true&facet.field=web_entity_id&facet.limit=1000'
  	var url = solrEndpoint + 'select?q='+encodeURIComponent(query_simple)+'&rows=1000&fl=web_entity+web_entity_id+url+lru+id&wt=json&indent=true&hl=true&hl.simple.pre=<strong>&hl.simple.post=<%2Fstrong>&hl.usePhraseHighlighter=true&hl.fragsize=1000&hl.mergeContiguous=true'
  	d3.json(url)
    	.get(function(data){
    		$timeout(function(){
	    		console.log('data received', data)
	    		$scope.resultsLoaded = true
	    		$scope.resultsHighlighting = data.highlighting
	    		$scope.results = data.response.docs
	    		$scope.$apply()
    		})
    	});
  }


  $translatePartialLoader.addPart('home')
  $translate.refresh()

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