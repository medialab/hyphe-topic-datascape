'use strict';

/* Services */

// FIXME: clean this dirty hack
var stickyModeHeight = 80;

angular.module('app.directives', [])
  
.directive('ngPressEnter', [function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          scope.$eval(attrs.ngPressEnter)
          event.preventDefault()
          scope.$apply()
        }
      })
    }
  }])

.directive('topicsMatrix', function ($timeout, $translatePartialLoader, $translate, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        topics: '=',
        topicRanks: '=',
        crossings: '=',
        selectedCrossing: '='
      },
      link: function($scope, el, attrs) {
        var topicLabels = {}

        el.html('<div><center>Loading...</center></div>')

        $scope.$watchCollection(['topics', 'topicsRanks', 'crossings'], redraw)
        $scope.$watch('selectedCrossing', redraw)

        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        // Translations
        $translatePartialLoader.addPart('data');
        $translate.refresh();
        $rootScope.$on('$translateChangeSuccess', updateTranslations)
        $timeout(updateTranslations)
        function updateTranslations(){
          $translate($scope.topics.map(function(t){return t.id})).then(function (translations) {
            topicLabels = translations
            redraw()
          })
        }

        function redraw() {
          $timeout(function(){

            // clear
            el.html('')

            var margin = {top: 150, right: 24, bottom: 64, left: 150}
            var width = el[0].offsetWidth - margin.left - margin.right 
            var height = width // square space

            var maxR = width / (2 * $scope.topics.length)

            var x = d3.scaleLinear()
              .range([0, width]);

            var y = d3.scaleLinear()
              .range([0, height]);

            var size = d3.scaleLinear()
              .range([0, 0.85 * maxR])

            var a = function(r){
              return Math.PI * Math.pow(r, 2)
            }

            var r = function(a){
              return Math.sqrt(a/Math.PI)
            }

            x.domain([0, $scope.topics.length - 1])
            y.domain([0, $scope.topics.length - 1])
            size.domain(d3.extent($scope.crossings, function(d){return r(d.val)}))

            var svg = d3.select(el[0]).append("svg")
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
                .attr('y1', function(d){ return y($scope.topicRanks[d.id]) })
                .attr('x2', width)
                .attr('y2', function(d){ return y($scope.topicRanks[d.id]) })
                .style("stroke", 'rgba(0, 0, 0, 0.06)')

            // Vertical lines
            svg.selectAll('line.v')
                .data($scope.topics)
              .enter().append('line')
                .attr('class', 'v')
                .attr('x1', function(d){ return x($scope.topicRanks[d.id]) })
                .attr('y1', 0)
                .attr('x2', function(d){ return x($scope.topicRanks[d.id]) })
                .attr('y2', height)
                .style("stroke", 'rgba(0, 0, 0, 0.06)')

            // Horizontal labels
            svg.selectAll('text.h')
                .data($scope.topics)
              .enter().append('text')
                .attr('class', 'h')
                .attr('x', -12)
                .attr('y', function(d){ return y($scope.topicRanks[d.id]) + 3 })
                .text( function (d) { return topicLabels[d.id] || d.id })
                .style('text-anchor', 'end')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", function(d){
                  if (
                    $scope.selectedCrossing !== undefined
                    && (d.id == $scope.selectedCrossing[0] || d.id == $scope.selectedCrossing[1])
                  ) {
                    return 'rgba(0, 0, 0, 1)'
                  } else {
                    return 'rgba(0, 0, 0, 0.5)'
                  }
                })

            // Vertical labels
            svg.selectAll('text.v')
                .data($scope.topics)
              .enter().append('text')
                .attr('class', 'v')
                .attr('x', function(d){ return x($scope.topicRanks[d.id]) + 3 })
                .attr('y', -12)
                .text( function (d) { return topicLabels[d.id] || d.id })
                .style('text-anchor', 'end')
                .style('writing-mode', 'vertical-lr')
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("fill", function(d){
                  if (
                    $scope.selectedCrossing !== undefined
                    && (d.id == $scope.selectedCrossing[0] || d.id == $scope.selectedCrossing[1])
                  ) {
                    return 'rgba(0, 0, 0, 1)'
                  } else {
                    return 'rgba(0, 0, 0, 0.5)'
                  }
                })

            // Dots
            var dot = svg.selectAll(".dot")
                .data($scope.crossings)
              .enter().append('g')
                .style('cursor', 'pointer')
                .on('click', function(d){
                  $timeout(function(){
                    $scope.selectedCrossing = [d.t2, d.t1, d.val]
                    $scope.$apply()
                  })
                })

            dot.append("circle")
              .attr("class", "dot")
              .attr("r", maxR)
              .attr("cx", function(d) { return x($scope.topicRanks[d.t1]); })
              .attr("cy", function(d) { return y($scope.topicRanks[d.t2]); })
              .style("fill", function(d){
                if ($scope.selectedCrossing !== undefined && d.t1 == $scope.selectedCrossing[0] && d.t2 == $scope.selectedCrossing[1]) {
                  return 'rgba(255, 255, 255, 1)'
                } else if ($scope.selectedCrossing !== undefined && d.t1 == $scope.selectedCrossing[1] && d.t2 == $scope.selectedCrossing[0]) {
                  return 'rgba(255, 255, 255, 1)'
                } else {
                  return 'rgba(255, 255, 255, 0)'
                }
              })
              
            dot.append("circle")
              .attr("class", "dot")
              .attr("r", function(d) { return size(r(d.val) ); })
              .attr("cx", function(d) { return x($scope.topicRanks[d.t1]); })
              .attr("cy", function(d) { return y($scope.topicRanks[d.t2]); })
              .style("fill", function(d) {
                if ($scope.selectedCrossing !== undefined && d.t1 == $scope.selectedCrossing[0] && d.t2 == $scope.selectedCrossing[1]) {
                  return 'rgba(0, 0, 0, 1)'
                } else if ($scope.selectedCrossing !== undefined && d.t1 == $scope.selectedCrossing[1] && d.t2 == $scope.selectedCrossing[0]) {
                  return 'rgba(0, 0, 0, 1)'
                } else {
                  return 'rgba(80, 80, 80, 0.7)'
                }
              })

          })
        }
      }
    }
  })

.directive('topicsCrossing', function ($timeout, $translatePartialLoader, $translate, $rootScope, $filter) {
    return {
      restrict: 'A',
      scope: {
        topics: '=',
        topicsIndex: '=',
        crossing: '='
      },
      link: function($scope, el, attrs) {
        var topicLabels = {}

        el.html('<div><center>Loading...</center></div>')

        $scope.$watchCollection(['topics', 'topicsIndex'], redraw)
        $scope.$watch('crossing', redraw)

        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          window.removeEventListener('resize', redraw)
        })

        // Translations
        $translatePartialLoader.addPart('data');
        $translate.refresh();
        $rootScope.$on('$translateChangeSuccess', updateTranslations)
        $timeout(updateTranslations)
        function updateTranslations(){
          $translate($scope.topics.map(function(t){return t.id})).then(function (translations) {
            topicLabels = translations
            redraw()
          })
        }

        function redraw() {
          if ($scope.crossing && $scope.crossing.length > 0) {

            $timeout(function(){

              // clear
              el.html('')

              var margin = {top: 50, right: 12, bottom: 12, left: 12}
              var width = el[0].offsetWidth - margin.left - margin.right
              var height = width * 2

              var svg = d3.select(el[0]).append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // Set text elements
              var textElements = [
                
                // Top
                {
                  text: topicLabels[$scope.crossing[0]] || $scope.crossing[0],
                  y: width/4 - 5,
                  fontSize: '13px',
                  opacity: 0.7
                },
                {
                  text: $filter('number')($scope.topicsIndex[$scope.crossing[0]].nb_pages) + ' pages',
                  y: width/4 + 15,
                  fontSize: '14px',
                  opacity: 1
                },

                // Bottom
                {
                  text: topicLabels[$scope.crossing[1]] || $scope.crossing[1],
                  y: 5 * width / 4 - 15,
                  fontSize: '13px',
                  opacity: 0.7
                },
                {
                  text: $filter('number')($scope.topicsIndex[$scope.crossing[1]].nb_pages) + ' pages',
                  y: 5 * width / 4 + 5,
                  fontSize: '14px',
                  opacity: 1
                },

                // Center
                {
                  text: $filter('number')($scope.crossing[2]) + ' pages',
                  y: 3 * width / 4,
                  fontSize: '14px',
                  opacity: 1
                },
                {
                  text: $filter('number')(Math.round(100 * $scope.crossing[2]/$scope.topicsIndex[$scope.crossing[0]].nb_pages)) + '%',
                  y: width/2 + 15,
                  fontSize: '10px',
                  opacity: 0.5
                },
                {
                  text: $filter('number')(Math.round(100 * $scope.crossing[2]/$scope.topicsIndex[$scope.crossing[1]].nb_pages)) + '%',
                  y: width - 15,
                  fontSize: '10px',
                  opacity: 0.5
                }

              ]

              // Draw upper circle background
              svg.append("circle")
                .attr("class", "venn")
                .attr("r", width/2)
                .attr("cx", width/2)
                .attr("cy", width/2)
                .style("fill", 'rgba(255, 255, 255, .6)')

              // Draw lower circle background
              svg.append("circle")
                .attr("class", "venn")
                .attr("r", width/2)
                .attr("cx", width/2)
                .attr("cy", width)
                .style("fill", 'rgba(255, 255, 255, .6)')

              // Draw upper circle line
              svg.append("circle")
                .attr("class", "venn")
                .attr("r", width/2)
                .attr("cx", width/2)
                .attr("cy", width/2)
                .style("stroke", 'rgba(0, 0, 0, .1)')
                .style('fill', 'none')

              // Draw lower circle line
              svg.append("circle")
                .attr("class", "venn")
                .attr("r", width/2)
                .attr("cx", width/2)
                .attr("cy", width)
                .style("stroke", 'rgba(0, 0, 0, .1)')
                .style('fill', 'none')

              // Draw top text
              svg.selectAll('text')
                  .data(textElements)
                .enter().append('text')
                  .attr('x', width/2)
                  .attr('y', function(d){ return d.y + 4 })
                  .text( function (d) { return d.text })
                  .style('text-anchor', 'middle')
                  .attr('font-family', 'sans-serif')
                  .attr('font-size', function(d){return d.fontSize})
                  .attr('fill', function(d){ return 'rgba(0, 0, 0, ' + d.opacity + ')' })
            })
          }
        }
      }
    }
  })
