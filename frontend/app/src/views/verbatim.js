'use strict';

angular.module('app.verbatim', ['ngRoute', 'ngSanitize'])

.config(function($routeProvider) {
  $routeProvider.when('/verbatim/:id', {
    templateUrl: 'src/views/verbatim.html'
  , controller: 'VerbatimController'
  })
})

.controller('VerbatimController', function(
	$scope,
	$location,
	$translate,
	$translatePartialLoader,
	$timeout,
	$mdColors,
	solrEndpoint,
	columnMeasures,
	topics,
	$routeParams,
	webentitiesService,
    $sanitize,
    $sce
) {

	$translatePartialLoader.addPart('data')
  $translatePartialLoader.addPart('verbatim')
  $translate.refresh()

	$scope.topics = []
	$scope.verbatimLoaded = false
	$scope.verbatimMode = "canola"
	$scope.webentity

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentityExpanded = 0
	$scope.flexColMapWe = columnMeasures.verbatim.mapwe
	$scope.flexColMap = columnMeasures.verbatim.map
	$scope.flexColVerbatim = columnMeasures.verbatim.verbatim
	$scope.flexColTopics = columnMeasures.verbatim.topics
	$scope.showNetworkMap = true
	$scope.widthLeftHandle = columnMeasures.handle
	$scope.widthRightHandle = 0

  $scope.transition = function(destination, settings) {
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
				$scope.widthRightHandle = 0
				$timeout(function(){ $location.path('/webentity/'+$scope.result.web_entity_id) }, transitionTime)
  			break
  		case 'topic':
  			$scope.transitioning = true
  			$scope.flexColWebentityExpanded = 0
				$scope.flexColMapWe = 0
				$scope.flexColMap = columnMeasures.we.map
				$scope.flexColVerbatim = 0
				$scope.flexColTopics = columnMeasures.topic.topic
				$scope.widthLeftHandle = 0
				$scope.widthRightHandle = 0
				$scope.showNetworkMap = false
				$timeout(function(){ $location.path('/topic/'+settings.topic) }, transitionTime)
  			break
  		case 'home':
  			$scope.transitioning = true
  			$scope.flexColWebentityExpanded = 0
				$scope.flexColMapWe = columnMeasures.search.map
				$scope.flexColMap = 100
				$scope.flexColVerbatim = columnMeasures.search.search
				$scope.flexColTopics = columnMeasures.search.topics
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/') }, transitionTime)
  			break
  	}
  }


  init()

  function init() {
  	$scope.verbatimId = decodeURIComponent($routeParams.id)
  	if ($scope.verbatimId == '') {
  		$location.path('/')
  	} else {
  		query('id:"'+$scope.verbatimId+'"')
  		// query('id:'+$scope.verbatimId.replace(/:/gi, '\\:'))
  	}
  }

  function query(q) {
  	var url = solrEndpoint + 'select?q='+encodeURIComponent(q)
  	url += '&rows=1'
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
	    		$scope.verbatimLoaded = true
	    		$scope.result = data.response.docs[0]
	    		// Tweak: add new lines in the CANOLA version
	    		$scope.result.textCanolaTWEAKED = $scope.result.textCanola.replace(/[\r\n]/gi, '<br><br>')
	    		// Tweak: try and complete missing host from CSS urls
                var host = $scope.result.url.replace(/^(https?:\/\/[^\/]+)\/?.*$/i, '$1'),
                    html2 = $sanitize($scope.result.html)
                $scope.result.html.match(/<link [^>]*(?:rel="stylesheet"|type="text\/css") [^>]*href="[^"]+"[^>]*>/ig).forEach(function(css) {
                    html2 = css.replace(/href="\//, 'href="' + host + '/') + html2
                })
	    		$scope.result.htmlTWEAKED = $sce.trustAsHtml(html2)

	    		$scope.topics = topics.filter(function(t){
	    			return $scope.result[t]
	    		})

	    		webentitiesService.getIndex(function(index){
			  		$scope.webentity = index[$scope.result.web_entity_id]
			  		$scope.$apply()
			  	})

	    		$scope.$apply()
    		})
    	});
  }

})
