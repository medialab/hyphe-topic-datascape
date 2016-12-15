'use strict';

angular.module('app.home', ['ngRoute', 'ngMaterial'])

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
  $window,
  $translate,
  $translatePartialLoader,
  $timeout,
  $mdColors,
  solrEndpoint,
  columnMeasures,
  topics,
  $routeParams,
  persistance,
  datascapeTitle,
  datascapeLogos
) {

  $scope.searchQuery
  $scope.resultsLoaded = false
  $scope.resultsLoading = false
  $scope.results
  $scope.resultsByPage = 100
  $scope.totalResults
  $scope.infiniteResults
  $scope.resultsHighlighting
  $scope.descSize = 100
  $scope.webentityScores
  $scope.highlightedEntity
  $scope.datascapeTitle = datascapeTitle
  $scope.datascapeLogos = datascapeLogos

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
    initQuery()
  }

  $scope.topicQuery = function(event, topic) {
    if (event.ctrlKey) {
      $scope.searchQuery += ' AND '+topic+':true'
    } else {
      $scope.searchQuery = topic+':true'
    }
    initQuery()
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

  function initQuery() {
    updateSearchQuery()
    queryUrl()
  }

  function buildQueryUrl(nextResults, downloadCsv) {

    var url = solrEndpoint + 'select?q='+encodeURIComponent($scope.searchQuery)

    // We break down the query for more readability and sustainability.
    // See parameters there: https://wiki.apache.org/solr/CommonQueryParameters
    
    // Rows
    url += '&rows=' + (downloadCsv ? $scope.totalResults : $scope.resultsByPage)
    if (nextResults && !downloadCsv) {
      url += '&start=' + $scope.infiniteResults.numLoaded_;
    }

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
      'id',
      'url',
      'web_entity_id',
      'web_entity',
      'textCanola'
    ]
    if (downloadCsv) {
      fields = fields.concat($scope.topics)
    }
    url += '&fl=' + fields.map(encodeURIComponent).join('+')

    // Output format
    url += '&wt=' + (downloadCsv ? 'csv' : 'json')
    url += '&indent=false'

    // Highlight
    var highlight = !downloadCsv
    if (highlight) {
      var highlight_before = '<strong>'
      var highlight_after = '</strong>'
      url += '&hl=true'
      url += '&hl.simple.pre=' + encodeURIComponent(highlight_before)
      url += '&hl.simple.post=' + encodeURIComponent(highlight_after)
      url += '&hl.usePhraseHighlighter=true'
      url += '&hl.fragsize=' + $scope.descSize  // Fragment 
      url += '&hl.mergeContiguous=true'
    }

    // Facet
    var facet = !nextResults || !downloadCsv
    if (facet) {
      url += '&facet=true'
      url += '&facet.limit=10000'
      url += '&facet.field=web_entity_id'
    }

    return url
  }

  $scope.downloadSearchResults = function() {
    $window.open(buildQueryUrl(false, true), '_blank')
  }

  function queryUrl(nextResults) {
    var url = buildQueryUrl(nextResults)
    if (!nextResults) {
      $scope.resultsLoading = true
      $scope.resultsLoaded = false
      console.log('Query:', url)
    }
    d3.json(url)
      .get(function(data){
        $timeout(function(){
          if (!nextResults) {
            $scope.resultsLoaded = true
            $scope.resultsLoading = false
            $scope.resultsHighlighting = {}
            $scope.results = data.response.docs
            $scope.totalResults = data.response.numFound
            $scope.webentityScores = buildWebentityScores(data.facet_counts.facet_fields.web_entity_id)
          } else {
            $scope.results = $scope.results.concat(data.response.docs)
            $scope.infiniteResults.numLoaded_ = $scope.infiniteResults.toLoad_;
          }
          for (var key in data.highlighting) {
            if (data.highlighting[key].text) {
              $scope.resultsHighlighting[key] = data.highlighting[key]
            } else {
              $scope.resultsHighlighting[key] = {text: [data.response.docs.filter(function(d) { return d.id === key })[0].textCanola.slice(0, $scope.descSize) + '…']}
            }
          }
          $scope.$apply()
        })
      });
  }

  $scope.infiniteResults = {
    numLoaded_: 0,
    toLoad_: 0,

    // Required.
    getItemAtIndex: function(index) {
      if (index > this.numLoaded_) {
        this.fetchMoreItems_(index)
        return null
      }
      return $scope.results[index]
    },

    getLength: function() {
      return Math.min(this.numLoaded_ + 5, $scope.totalResults);
    },

    fetchMoreItems_: function(index) {
      if (this.toLoad_ < index) {
        this.toLoad_ += $scope.resultsByPage;
        queryUrl(true)
      }
    }
  }

  function updateSearchQuery() {
    persistance.lastQuery = $scope.searchQuery
    $location.path('/search/' + encodeURIComponent($scope.searchQuery))
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
