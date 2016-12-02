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

  // Columns dynamic width
	$scope.transitioning = false
	$scope.flexColMap = 0
	$scope.flexColSearch = 0
	$scope.flexColTopics = columnMeasures.topics.topics
	$scope.flexColSide = columnMeasures.topics.side
	$scope.widthLeftHandle = columnMeasures.handle
	$scope.widthRightHandle = 0

  $scope.topics = []
  $scope.topicsLoaded = false

  $scope.$watch('topics', updateMatrix)

  $scope.transition = function(destination) {
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
				$timeout(function(){ $location.path('/') }, transitionTime)
  			break
  	}
  }

  init()

  function init() {
    topicsService.get(function(topics){
      $scope.topics = topics
      $scope.topicsLoaded = true
    })
  }

  function updateMatrix() {
    $timeout(function(){

      // Build data
      // ----------
      var topicRanks = {}
      // Rank = original index
      $scope.topics.forEach(function(t,i){
        topicRanks[t.id] = i
      })
      var crossings = []
      $scope.topics.forEach(function(t1){
        $scope.topics.forEach(function(t2){
          crossings.push({
            t1: t1.id,
            t2: t2.id,
            val: +t1[t2.id]
          })
        })
      })

      // Draw
      // ----
      var container = document.querySelector('#topics-matrix')

      // clear
      container.innerHTML = ''

      var margin = {top: 150, right: 24, bottom: 64, left: 150}
      var width = container.clientWidth - margin.left - margin.right
      var height = width // square space

      var maxR = width / (2 * $scope.topics.length)

      var x = d3.scaleLinear()
        .range([0, width]);

      var y = d3.scaleLinear()
        .range([0, height]);

      var size = d3.scaleLinear()
        .range([0, maxR])

      var a = function(r){
        return Math.PI * Math.pow(r, 2)
      }

      var r = function(a){
        return Math.sqrt(a/Math.PI)
      }

      x.domain([0, $scope.topics.length - 1])
      y.domain([0, $scope.topics.length - 1])
      size.domain(d3.extent(crossings, function(d){return r(d.val)}))

      var svg = d3.select(container).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      // Horizontal lines
      svg.selectAll('line.h')
          .data($scope.topics)
        .enter().append('line')
          .attr('class', 'h')
          .attr('x1', 0)
          .attr('y1', function(d){ return y(topicRanks[d.id]) })
          .attr('x2', width)
          .attr('y2', function(d){ return y(topicRanks[d.id]) })
          .style("stroke", 'rgba(0, 0, 0, 0.06)')

      // Vertical lines
      svg.selectAll('line.v')
          .data($scope.topics)
        .enter().append('line')
          .attr('class', 'v')
          .attr('x1', function(d){ return x(topicRanks[d.id]) })
          .attr('y1', 0)
          .attr('x2', function(d){ return x(topicRanks[d.id]) })
          .attr('y2', height)
          .style("stroke", 'rgba(0, 0, 0, 0.06)')

      // Dots
      var dot = svg.selectAll(".dot")
          .data(crossings)
        .enter().append('g')
          .style('cursor', 'pointer')

      dot.append("circle")
        .attr("class", "dot")
        .attr("r", maxR) // A = PI.r² ; r = SQRT(A/PI)
        .attr("cx", function(d) { return x(topicRanks[d.t1]); })
        .attr("cy", function(d) { return y(topicRanks[d.t2]); })
        .style("fill", 'rgba(255, 255, 255, 0.0)')
        
      dot.append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return size(r(d.val) ); }) // A = PI.r² ; r = SQRT(A/PI)
        .attr("cx", function(d) { return x(topicRanks[d.t1]); })
        .attr("cy", function(d) { return y(topicRanks[d.t2]); })
        .style("fill", function(d) { return 'rgba(0, 0, 0, 0.6'; });

      $scope.$apply()
    })
  }

})