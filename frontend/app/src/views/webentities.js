'use strict';

angular.module('app.webentities', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/webentities', {
    templateUrl: 'src/views/webentities.html'
  , controller: 'WebentitiesController'
  })
  $routeProvider.when('/webentities/:query', {
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
	webentitiesService,
  $routeParams,
  persistance
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

  $scope.execSearchQuery = function() {
    var query_simple = $scope.searchQuery
    query($scope.searchQuery)
  }

  init()

  function init() {
    if ($routeParams.query !== undefined && $routeParams.query !== 'undefined' && $routeParams.query !== '') {
      $scope.searchQuery = decodeURIComponent($routeParams.query)
      $scope.execSearchQuery()
    } else if(persistance.lastQuery !== undefined && persistance.lastQuery !== 'undefined' && persistance.lastQuery !== '') {
      $scope.searchQuery = decodeURIComponent(persistance.lastQuery)
      $scope.execSearchQuery()
    }

  	webentitiesService.get(function(wes){
  		console.log('web entity sample:', wes[Math.floor(Math.random()*wes.length)])
  		$scope.webentities = wes
  		$scope.webentitiesLoaded = true
  	})
  }

  function query(q) {
    updateSearchQuery(q)

    var url = solrEndpoint + 'select?q='+encodeURIComponent(q)

    // We break down the query for more readability and sustainability.
    // See parameters there: https://wiki.apache.org/solr/CommonQueryParameters
    
    // Rows
    url += '&rows=0'

    // Output format
    url += '&wt=json'
    url += '&indent=false'

    // Facet
    var facet = true
    if (facet) {
      url += '&facet=true'
      url += '&facet.limit=10000'
      url += '&facet.field=web_entity_id'
    }

    queryUrl(url)
  }

  function queryUrl(url) {
    $scope.resultsLoading = true
    $scope.resultsLoaded = false
    console.log('query', url)
    d3.json(url)
      .get(function(data){
        $timeout(function(){
          console.log('data received', data)
          // $scope.results = data.response.docs
          $scope.$apply()
        })
      });
  }

  function updateSearchQuery(q) {
    persistance.lastQuery = q
    $location.path('/webentities/' + encodeURIComponent(q))
  }

})