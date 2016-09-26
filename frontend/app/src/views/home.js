'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
})

.controller('HomeController', function($scope, $location, $translate, $translatePartialLoader, solrEndpoint) {
	$scope.searchQuery

  $scope.execSearchQuery = function() {
  	var query_simple = $scope.searchQuery
  	var url = solrEndpoint + 'select?q='+encodeURIComponent(query_simple)+'&rows=0&fl=url+web_entity_id&wt=json&indent=true&facet=true&facet.field=web_entity_id&facet.limit=1000'
  	d3.json(url)
    	.get(function(data){
    		console.log('data received', data)
    	});
  }

  $translatePartialLoader.addPart('home')
  $translate.refresh()

  init()

  function init() {
	  sigma.parsers.gexf(
		  'data/network.gexf',
		  { container: 'sigmaContainer' }
		);
  }

})