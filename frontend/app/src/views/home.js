'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/', {
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
	topics
) {

	$scope.searchQuery
	$scope.resultsLoaded = false
	$scope.resultsLoading = false
	$scope.results
	$scope.resultsHighlighting

	$scope.topics = topics

	// Columns dynamic width
	$scope.transitioning = false
	$scope.flexColWebentities = 0
	$scope.flexColMap = columnMeasures.search.map
	$scope.flexColMapH = 100
	$scope.flexColSearch = columnMeasures.search.search
	$scope.flexColTopics = columnMeasures.search.topics
	$scope.widthLeftHandle = columnMeasures.handle
	$scope.widthRightHandle = columnMeasures.handle

  $scope.transition = function(destination) {
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
				$timeout(function(){ $location.path('/webentities') }, transitionTime)
  			break
  		case 'verbatim':
  			$scope.transitioning = true
  			$scope.flexColMap = columnMeasures.verbatim.mapwe
  			$scope.flexColMapH = columnMeasures.verbatim.map
				$scope.flexColSearch = columnMeasures.verbatim.verbatim
				$scope.flexColTopics = columnMeasures.verbatim.topics
				$scope.widthLeftHandle = columnMeasures.handle
				$scope.widthRightHandle = 0
				$timeout(function(){ $location.path('/verbatim') }, transitionTime)
  			break
  		case 'topics':
  			$scope.transitioning = true
  			$scope.flexColMap = 0
  			$scope.flexColWebentities = 0
				$scope.flexColSearch = 0
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
  	$scope.searchQuery = topic.id+':true'
  	query($scope.searchQuery)
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
  function query(q) {
  	var url = solrEndpoint + 'select?q='+encodeURIComponent(q)

  	// We break down the query for more readability and sustainability.
  	// See parameters there: https://wiki.apache.org/solr/CommonQueryParameters
  	
  	// Rows
  	url += '&rows=1000'

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
  	queryUrl(url)
  }

  function queryUrl(url) {
  	$scope.resultsLoading = true
		$scope.resultsLoaded = false
  	d3.json(url)
    	.get(function(data){
    		$timeout(function(){
	    		console.log('data received', data)
	    		$scope.resultsLoaded = true
	    		$scope.resultsLoading = false
	    		$scope.resultsHighlighting = data.highlighting
	    		$scope.results = data.response.docs
	    		$scope.$apply()
    		})
    	});
  }

})