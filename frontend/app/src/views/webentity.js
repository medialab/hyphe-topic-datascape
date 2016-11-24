'use strict';

angular.module('app.webentity', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/webentity/:id', {
    templateUrl: 'src/views/webentity.html'
  , controller: 'WebentityController'
  })
})

.controller('WebentityController', function (
	$scope,
	$location,
	$translate,
	$translatePartialLoader,
	$timeout,
	$mdColors,
	solrEndpoint,
	columnMeasures,
	$routeParams,
	webentitiesService
) {

  $translatePartialLoader.addPart('webentity')
  $translate.refresh()

  $scope.webentity
	$scope.webentityLoaded = false
  $scope.pagesLoaded = false

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentityExpanded = columnMeasures.we.we
	$scope.flexColMapDocs = columnMeasures.we.mapdocs
	$scope.flexColMap = columnMeasures.we.map
	$scope.flexColVerbatim = 0
	$scope.flexColTopics = 0
	$scope.widthLeftHandle = 0
	$scope.widthRightHandle = 0

  $scope.transition = function(destination, settings) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'verbatim':
	  		$scope.transitioning = true
				$scope.flexColWebentityExpanded = 0
				$scope.flexColMapDocs = columnMeasures.verbatim.mapwe
				$scope.flexColMap = columnMeasures.verbatim.map
				$scope.flexColVerbatim = columnMeasures.verbatim.verbatim
				$scope.flexColTopics = columnMeasures.verbatim.topics
				$scope.widthLeftHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/verbatim/'+encodeURIComponent(settings.verbatim)) }, transitionTime)
  			break
  		case 'webentities':
	  		$scope.transitioning = true
				$scope.flexColWebentityExpanded = columnMeasures.wes.wes
				$scope.flexColMapDocs = columnMeasures.wes.map
				$scope.flexColMap = 100
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/webentities') }, transitionTime)
  			break
  	}
  }

  $scope.pages = []
  for (var i=0; i<1000; i++) {
  	$scope.pages.push(createDummyPage())
  }

  // Dummy page generation for the demo
	function createDummyPage() {
		var page = {}
		var seed = Math.random()
		page.url = (''+seed).replace('0.', 'http://gaga.com')
			.replace(/[01]/gi, '/')
			.replace(/[23]/gi, 'p')
			.replace(/[45]/gi, 'o')
			.replace(/[67]/gi, 'n')
			.replace(/8/gi, 'e')
			.replace(/9/gi, 'y')
		page.title = (''+seed).replace('0.', 'Hold ')
			.replace(/[01]/gi, 'the ')
			.replace(/[23]/gi, 'te ')
			.replace(/[45]/gi, 'door ')
			.replace(/[67]/gi, 'ho ')
			.replace(/[89]/gi, 'dor ')
		page.text = (''+seed).replace('0.', 'Hold the door, ')
			.replace(/[012]/gi, 'hold te door, ')
			.replace(/[345]/gi, 'hol te door, ')
			.replace(/[67]/gi, 'hol door, ')
			.replace(/[89]/gi, 'Hodor. Hold the door, ')
			+ 'Hodor.'
		return page
	}

  init()

  function init() {
  	$scope.weId = decodeURIComponent($routeParams.id)
  	if ($scope.weId == '') {
  		$location.path('/')
  	} else {
  		query('web_entity_id:"'+$scope.weId+'"')
  		webentitiesService.getIndex(function(index){
	  		$scope.webentity = index[$scope.weId]
	  		$scope.webentityLoaded = true
	  	})
  	}
  }

  function query(q) {
  	var url = solrEndpoint + 'select?q='+encodeURIComponent(q)
  	url += '&rows=1000'
  	url += '&wt=json'
  	url += '&indent=false'
   	queryUrl(url)
  }

  function queryUrl(url) {
  	$scope.resultsLoading = true
		$scope.resultsLoaded = false
  	d3.json(url)
    	.get(function(data){
    		$timeout(function(){
	    		$scope.pagesLoaded = true
	    		$scope.results = data.response.docs
	    		$scope.$apply()
    		})
    	});
   }
})