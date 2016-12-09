'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
  $routeProvider.when('/search/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
  $routeProvider.when('/search/:query', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })
})

.controller('HomeController', function(
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
  persistance
) {

	$scope.searchQuery
	$scope.resultsLoaded = false
	$scope.resultsLoading = false
	$scope.results
	$scope.resultsHighlighting
  $scope.webentityScores
  $scope.highlightedEntity

	$scope.topics = topics

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentities = 0
	$scope.flexColMap = columnMeasures.search.map
	$scope.flexColMapH = 100
	$scope.flexColSearch = columnMeasures.search.search
	$scope.flexColTopics = columnMeasures.search.topics
  $scope.showNetworkMap = true
	$scope.widthLeftHandle = columnMeasures.handle
	$scope.widthRightHandle = columnMeasures.handle

  $scope.transition = function(destination, settings) {
  	var transitionTime = 200
  	switch (destination) {
  		case 'webentities':
  			$scope.transitioning = true
  			$scope.flexColMap = columnMeasures.wes.map
  			$scope.flexColWebentities = columnMeasures.wes.wes
				$scope.flexColSearch = 0
				$scope.flexColTopics = 0
				$scope.widthLeftHandle = 0
				$scope.widthRightHandle = columnMeasures.handle
				$timeout(function(){ $location.path('/webentities/'+encodeURIComponent($scope.searchQuery)) }, transitionTime)
  			break
  		case 'verbatim':
  			$scope.transitioning = true
  			$scope.flexColMap = columnMeasures.verbatim.mapwe
  			$scope.flexColMapH = columnMeasures.verbatim.map
				$scope.flexColSearch = columnMeasures.verbatim.verbatim
				$scope.flexColTopics = columnMeasures.verbatim.topics
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = 0
				console.log('/verbatim/'+settings.verbatim)
				$timeout(function(){ $location.path('/verbatim/'+encodeURIComponent(settings.verbatim)) }, transitionTime)
  			break
  		case 'topics':
  			$scope.transitioning = true
  			$scope.flexColMap = 0
  			$scope.flexColWebentities = 0
				$scope.flexColSearch = 0
        $scope.showNetworkMap = false
				$scope.flexColTopics = columnMeasures.topics.topics
				$timeout(function(){ $location.path('/topics') }, transitionTime)
  			break
  	}
  }

  $scope.execSearchQuery = function() {
  	var query_simple = $scope.searchQuery
  	query($scope.searchQuery)
  }

  $scope.topicQuery = function(topic) {
  	$scope.searchQuery = topic+':true'
  	query($scope.searchQuery)
  }

  $scope.highlight = function(id) {
    $timeout(function(){
      $scope.highlightedEntity = id
    })
  }

  $scope.dishighlight = function(id) {
    $timeout(function(){
      if ($scope.highlightedEntity == id) {
        $scope.highlightedEntity = undefined
      }
    })
  }

  $translatePartialLoader.addPart('home')
  $translatePartialLoader.addPart('data')
  $translate.refresh()

  init()

  function init() {
    if ($routeParams.query !== undefined && $routeParams.query !== 'undefined' && $routeParams.query !== '') {
      $scope.searchQuery = decodeURIComponent($routeParams.query)
      $scope.execSearchQuery()
    } else if(persistance.lastQuery !== undefined && persistance.lastQuery !== 'undefined' && persistance.lastQuery !== '') {
      $scope.searchQuery = decodeURIComponent(persistance.lastQuery)
      $scope.execSearchQuery()
    }
  }

  function query(q) {
    updateSearchQuery(q)

  	var url = solrEndpoint + 'select?q='+encodeURIComponent(q)

  	// We break down the query for more readability and sustainability.
  	// See parameters there: https://wiki.apache.org/solr/CommonQueryParameters
  	
  	// Rows
  	url += '&rows=100'

  	// Fields list

  	// Available fields:
  	// - Topics: wearables, airspace, data_transmission, data_regulation_us, copyright, data_regulation_eu,
		//           bitcoin, cyberdefense, social_media, business_media, personal_records, surveillance_us,
		//           hacking, id_fraud, cookies, cybersecurity, crypto_access, education, telecom_ops_fr,
		//           surveillance_fr, bigdata, web_entity_id, cloud_security, health, research_it, citizen_freedom
		//           websecurity, terms_use, data_regulation_fr, mobile, comm_traces, transports, consumer_data
  	// - Web entity: web_entity, web_entity_status, 
  	// - Verbatim: text, html, textCanola
  	// - Other: id, corpus, encoding, original_encoding, lru, url, depth, _version_

  	var fields = [
  		'web_entity',
  		'web_entity_id',
  		'url',
  		'id'
  	]
  	url += '&fl=' + fields.map(encodeURIComponent).join('+')

  	// Output format
  	url += '&wt=json'
  	url += '&indent=false'

  	// Highlight
  	var highlight = true
  	if (highlight) {
  		var highlight_before = '<strong>'
  		var highlight_after = '</strong>'
	  	url += '&hl=true'
	  	url += '&hl.simple.pre=' + encodeURIComponent(highlight_before)
	  	url += '&hl.simple.post=' + encodeURIComponent(highlight_after)
	  	url += '&hl.usePhraseHighlighter=true'
	  	url += '&hl.fragsize=100'	// Fragment 
	  	url += '&hl.mergeContiguous=true'
  	}

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
		console.log('Query:', url)
  	d3.json(url)
    	.get(function(data){
    		$timeout(function(){
	    		// console.log('data received', data)
	    		$scope.resultsLoaded = true
	    		$scope.resultsLoading = false
	    		$scope.resultsHighlighting = data.highlighting
          $scope.results = data.response.docs
          $scope.webentityScores = buildWebentityScores(data.facet_counts.facet_fields.web_entity_id)
	    		$scope.$apply()
    		})
    	});
  }

  function updateSearchQuery(q) {
    persistance.lastQuery = q
    $location.path('/search/' + encodeURIComponent(q))
  }

  function buildWebentityScores(alternateArray) {
    var result = {}
    var flag = true
    var k
    alternateArray.forEach(function(d){
      if (flag) {
        k = d
        flag = false
      } else {
        if (d>0) {
          result[k] = d
        }
        flag = true
      }
    })
    return result
  }
})