'use strict';

angular.module('app.webentities', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/webentities', {
    templateUrl: 'src/views/webentities.html'
  , controller: 'WebentitiesController'
  })
})

.controller('WebentitiesController', function($scope, $location, $translate, $translatePartialLoader, $timeout, solrEndpoint) {

  $translatePartialLoader.addPart('webentities')
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