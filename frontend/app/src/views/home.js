'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
})

.controller('HomeController', function($scope, $location, $translate, $translatePartialLoader, $timeout, solrEndpoint) {
	$scope.searchQuery
	$scope.resultsLoaded = false
	$scope.results
	$scope.resultsHighlighting

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