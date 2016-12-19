'use strict';

angular.module('app.topics', ['ngRoute'])

.config(function($routeProvider) {
  $routeProvider.when('/topics', {
    templateUrl: 'src/views/topics.html'
  , controller: 'TopicsController'
  })
})

.controller('TopicsController', function(
  $scope,
  $location,
  $translate,
  $translatePartialLoader,
  $timeout,
  solrEndpoint,
  columnMeasures,
  topicsService
) {

  $translatePartialLoader.addPart('topics')
  $translate.refresh()

  $scope.topics = []
  $scope.topicRanks = {}  // Orders the matrix rows & cols
  $scope.crossings = []   // Matrix elements
  $scope.topicsIndex      // Necessary to retrieve names from ids
  $scope.topicsLoaded = false
  $scope.selectedCrossing = undefined

  $scope.$watch('topics', buildCrossings)

  // Columns dynamic width
  $scope.transitioning = false
  $scope.flexColMap = 0
  $scope.flexColSearch = 0
  $scope.flexRowTopic = 0
  $scope.flexRowMatrix = 100
  $scope.flexColTopics = columnMeasures.topics.topics
  $scope.flexColSide = columnMeasures.topics.side
  $scope.widthLeftHandle = columnMeasures.handle
  $scope.widthRightHandle = 0

  $scope.transition = function(destination, settings) {
    var transitionTime = 200 
    switch (destination) {
      case 'search':
        $scope.transitioning = true
        $scope.flexColMap = columnMeasures.search.map
        $scope.flexColSearch = columnMeasures.search.search
        $scope.flexColTopics = columnMeasures.search.topics
        $scope.flexColSide = 0
        $scope.widthLeftHandle = columnMeasures.handle
        $scope.widthRightHandle = columnMeasures.handle
        if (settings && settings.topicsOverlap) {
          $timeout(function(){ $location.path('/search/'+encodeURIComponent($scope.selectedCrossing[0] + ':true AND ' + $scope.selectedCrossing[1] + ':true')) }, transitionTime)
        } else {
          $timeout(function(){ $location.path('/') }, transitionTime)
        }
        break
      case 'topic':
        $scope.transitioning = true
        $scope.flexRowTopic = 50
        $scope.flexRowMatrix = 0
        $scope.widthLeftHandle = 0
        $timeout(function(){ $location.path('/topic/'+encodeURIComponent($scope.selectedCrossing[0]) + '/' + encodeURIComponent($scope.selectedCrossing[1])) }, transitionTime)
        break
    }
  }

  $scope.closeCrossing = function() {
    $scope.selectedCrossing = undefined
  }

  init()

  function buildCrossings() {
    $scope.topicRanks = {}
    // Rank = original index
    $scope.topics.forEach(function(t,i){
      $scope.topicRanks[t.id] = t.order
    })
    $scope.crossings = []
    $scope.topics.forEach(function(t1){
      $scope.topics.forEach(function(t2){
        $scope.crossings.push({
          t1: t1.id,
          t2: t2.id,
          val: +t1[t2.id]
        })
      })
    })
  }

  function init() {
    topicsService.get(function(topics){
      $scope.topics = topics
      $scope.topicsLoaded = true

      topicsService.getIndex(function(index){
        $scope.topicsIndex = index
      })
    })
  }

  

})
