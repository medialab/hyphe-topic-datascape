'use strict';

/* Services */

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

.directive('networkMap', function ($timeout, $translatePartialLoader, $translate, $rootScope, coordinatesService, $mdColors, persistance) {
    return {
      restrict: 'A',
      scope: {
        transitioning: '=',
        scores: '=',
        singleHighlight: '='
      },
      templateUrl: 'src/directives/networkMap.html',
      link: function($scope, el, attrs) {

        $scope.frozen = false
        $scope.loaded = false
        $scope.coordinates
        $scope.coordinatesIndex
        
        var container = el[0].querySelector('.canvas-container')
        
        $scope.$watch('scores', redraw)
        $scope.$watch('singleHighlight', redraw)
        $scope.$watch('transitioning', function(){
          if ($scope.transitioning && !$scope.frozen) {
            freeze()
          }
        })

        window.addEventListener('resize', redraw)
        $scope.$on('$destroy', function(){
          redraw = function(){}
          window.removeEventListener('resize', redraw)
        })

        // Translations
        /*$translatePartialLoader.addPart('data');
        $translate.refresh();
        $rootScope.$on('$translateChangeSuccess', updateTranslations)
        $timeout(updateTranslations)
        function updateTranslations(){
          $translate($scope.topics.map(function(t){return t.id})).then(function (translations) {
            topicLabels = translations
            redraw()
          })
        }*/

        init()

        function redraw() {
          if ($scope.frozen) return
          $timeout(function(){
            if ($scope.coordinatesIndex === undefined) return // Nothing to do if coordinates not loaded yet

            // clear
            container.innerHTML = ''

            var settings = {}
            settings.cloudRoundness = 0.025
            settings.dotsSize = 4
            settings.dotsMinimalOpacity = 0.2
            settings.highlightWhiteRadius = 12
            settings.highlightDotRadius = 5

            var bigRadius = settings.cloudRoundness * Math.min(el[0].offsetWidth, el[0].offsetHeight)

            var margin = {top: 12 + bigRadius, right: 12 + bigRadius, bottom: 12 + bigRadius, left: 12 + bigRadius}
            var width = el[0].offsetWidth
            var height = el[0].offsetHeight

            var chart = d3.select(container).append("canvas")
              .attr("width", width)
              .attr("height", height)

            var context = chart.node().getContext("2d")

            if (width <= 50) return // Prevent some glitches during resizing

            var xExtent = d3.extent($scope.coordinates.map(function(d){return +d.x}))
            var yExtent = d3.extent($scope.coordinates.map(function(d){return +d.y}))
            var xRatio = (xExtent[1] - xExtent[0]) / (width - margin.left - margin.right)
            var yRatio = (yExtent[1] - yExtent[0]) / (height - margin.top - margin.bottom)
            var xMid = (xExtent[0] + xExtent[1]) / 2
            var yMid = (yExtent[0] + yExtent[1]) / 2
            xRatio = Math.max(xRatio, yRatio)
            yRatio = Math.max(xRatio, yRatio)

            var x = function(d) {
              return width/2 + ((d - xMid) / (xRatio))
            }
            
            var y = function(d) {
              return height/2 + ((d - yMid) / (yRatio))
            }

            var borderRGB = d3.rgb($mdColors.getThemeColor('default-background-200'))
            var borderLayer = drawLayer($scope.coordinates, context, x, y, width, height, {
                size: bigRadius,
                rgb: [borderRGB.r, borderRGB.g, borderRGB.b],
                opacity: .5,
                blurRadius: 1.5 * bigRadius,
                contrastFilter: true,
                contrastThreshold: 0.8,
                contrastSteepness: 0.03
              })

            var fillingLayer = drawLayer($scope.coordinates, context, x, y, width, height, {
                size: bigRadius,
                rgb: [255, 255, 255],
                opacity: 0.15,
                blurRadius: 1.5 * bigRadius,
                contrastFilter: true,
                contrastThreshold: 0.85,
                contrastSteepness: 0.002
              })

            var imgd = mergeImgdLayers([borderLayer, fillingLayer], width, height)
            context.putImageData( imgd, 0, 0 )

            if ($scope.scores) {
              var id
              var maxScore = 0
              for (id in $scope.scores) {
                maxScore = Math.max(maxScore, $scope.scores[id])

              }

              var opct = d3.scaleLinear()
                .range([settings.dotsMinimalOpacity, 1])
                .domain([0, maxScore])

              // Draw filtered entities
              for (id in $scope.scores) {
                var score = $scope.scores[id]
                var node = $scope.coordinatesIndex[id]
                if (node) {
                  // A series of layers to simulate an opacity gradient
                  var layers_count = 6
                  var l
                  for (l=1/layers_count; l<=1; l+=1/layers_count) {
                    context.beginPath()
                    context.arc(x(node.x), y(node.y), l * l * settings.dotsSize, 0, 2*Math.PI, true)
                    context.fillStyle = $mdColors.getThemeColor('default-primary-900-' + Math.round(100 * opct(score) / layers_count)/100 )
                    context.fill()
                    context.closePath()
                  }
                }
              }
            }

            // Draw highlight
            if ($scope.singleHighlight) {
              var node = $scope.coordinatesIndex[$scope.singleHighlight]

              // White background
              context.beginPath()
              context.arc(x(node.x), y(node.y), settings.highlightWhiteRadius, 0, 2*Math.PI, true)
              context.fillStyle = '#FFF'
              context.fill()
              context.closePath()

              // Dot
              context.beginPath()
              context.arc(x(node.x), y(node.y), settings.highlightDotRadius, 0, 2*Math.PI, true)
              context.fillStyle = $mdColors.getThemeColor('default-primary-900-1')
              context.fill()
              context.closePath()
            }
          })
        }

        function freeze() {
          var context = container.querySelector('canvas').getContext("2d")
          var image = new Image();
          image.src = context.canvas.toDataURL("image/png");
          persistance.image = image.src
          image.className = 'blurred'
          container.innerHTML = ''
          container.appendChild(image)
          $scope.frozen = true
        }

        function init() {
          // Display cached image data
          if (persistance.image) {
            var image = new Image();
            image.src = persistance.image
            image.className = 'blurred'
            container.innerHTML = ''
            container.appendChild(image)
          }

          coordinatesService.get(function(c){
            $scope.coordinates = c
            coordinatesService.getIndex(function(index){
              $scope.coordinatesIndex = index
              $scope.loaded = true
              redraw()
            })
          })
        }
      }
    }
})

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
          redraw = function(){}
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

            if (width <= 50) return // Prevent some glitches during resizing

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
                  if (d.t1 != d.t2) {
                    $timeout(function(){
                      $scope.selectedCrossing = [d.t2, d.t1, d.val]
                      $scope.$apply()
                    })
                  }
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
          redraw = function(){}
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
              var height = width * 1.5

              if (width <= 50) return // Prevent some glitches during resizing

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

.directive('topicFocus', function ($timeout, $translatePartialLoader, $translate, $rootScope, topicsService, $location, solrEndpoint){
  return {
      restrict: 'A',
      scope: {
        topic: '=',
        close: '=',
        closeButton: '='
      },
      templateUrl: 'src/directives/topicFocus.html',
      link: function($scope, el, attrs) {

        $scope.webentityScores

        $translatePartialLoader.addPart('data')
        $translate.refresh()

        init()

        $scope.searchWord = function(w) {
          $location.path('/search/'+encodeURIComponent(w))
        }

        function init() {          
          query($scope.topic + ':true')
          topicsService.get(function(topics){
            $scope.topics = topics

            topicsService.getIndex(function(index){
              $scope.topicsIndex = index
              $scope.words = index[$scope.topic].words.split(';').map(capitalizeFirstLetter)
              $scope.pagesCount = index[$scope.topic].nb_pages

            })
          })
        }

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        function query(q) {

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
          d3.json(url)
            .get(function(data){
              $timeout(function(){
                $scope.webentityScores = buildWebentityScores(data.facet_counts.facet_fields.web_entity_id)
                $scope.$apply()
              })
            });
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

      }
    }
})




// Demanding functions used for rendering canvas layers

function drawLayer(coordinates, context, xScale, yScale, width, height, settings) {
  context.clearRect(0, 0, width, height);

  var color = 'rgba('+settings.rgb[0]+', '+settings.rgb[1]+', '+settings.rgb[2]+', '+settings.opacity+')'
  var minalpha = 0

  // This is to prevent transparent areas to be assimiled as "black"
  if (settings.contrastFilter) {
    minalpha = 0.1
    paintAll(context, width, height, 'rgba('+settings.rgb[0]+', '+settings.rgb[1]+', '+settings.rgb[2]+', '+minalpha+')')
  }

  coordinates.forEach(function(d){
    context.beginPath()
    context.arc(xScale(d.x), yScale(d.y), settings.size, 0, 2*Math.PI, true)
    context.fillStyle = color
    context.fill()
    context.closePath()
  })

  var imgd = context.getImageData(0, 0, width, height)

  if (settings.blurRadius > 0) {
    blur(imgd, width, height, settings.blurRadius)
  }

  if (settings.contrastFilter) {
    alphacontrast(imgd, width, height, minalpha, settings.contrastThreshold, settings.contrastSteepness)
  }

  return imgd
}

function mergeImgdLayers(imgdArray, w, h) {
  var imgd = imgdArray.shift()
  var imgd2
  while (imgd2 = imgdArray.shift()) {
    var pix = imgd.data
    var pix2 = imgd2.data
    for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
      var src_rgb = [pix2[i  ]/255, pix2[i+1]/255, pix2[i+2]/255]
      var src_alpha = pix2[i+3]/255
      var dst_rgb = [pix[i  ]/255, pix[i+1]/255, pix[i+2]/255]
      var dst_alpha = pix[i+3]/255
      var out_alpha = src_alpha + dst_alpha * (1 - src_alpha)
      var out_rgb = [0, 0, 0]
      if (out_alpha > 0) {
        out_rgb[0] = (src_rgb[0] * src_alpha + dst_rgb[0] * dst_alpha * (1 - src_alpha)) / out_alpha
        out_rgb[1] = (src_rgb[1] * src_alpha + dst_rgb[1] * dst_alpha * (1 - src_alpha)) / out_alpha
        out_rgb[2] = (src_rgb[2] * src_alpha + dst_rgb[2] * dst_alpha * (1 - src_alpha)) / out_alpha
      }
      pix[i  ] = Math.floor(out_rgb[0] * 255)
      pix[i+1] = Math.floor(out_rgb[1] * 255)
      pix[i+2] = Math.floor(out_rgb[2] * 255)
      pix[i+3] = Math.floor(out_alpha * 255)
    }
  }
  return imgd
}

function paintAll(ctx, w, h, color) {
  ctx.beginPath()
  ctx.rect(0, 0, w, h)
  ctx.fillStyle = color
  ctx.fill()
  ctx.closePath()
}

function alphacontrast(imgd, w, h, minalpha, threshold, factor) {
  var threshold255 = threshold * 255
  var contrast = buildConstrastFunction(factor, threshold255, minalpha)
  var pix = imgd.data

  // Split channels
  var channels = [[], [], [], []] // rgba
  for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    // Just process the alpha channel
    pix[i+3] = contrast(pix[i+3])
  }

}

function buildConstrastFunction(factor, threshold255, minalpha) {
  var samin = 255 / (1 + Math.exp( -factor * (0 - threshold255) ))
  var samax = 255 / (1 + Math.exp( -factor * (1 - threshold255) ))
  var contrast = function(alpha) {
    var alpha2 = alpha / ( 1 - minalpha ) - 255 * minalpha // Alpha corrected to remove the minalpha
    var s_alpha = 255 / (1 + Math.exp( -factor * (alpha2 - threshold255) )) // Sigmoid contrast
    return (s_alpha - samin) / (samax - samin) // Correct the extent of the sigmoid function
  }
  return contrast
}

function blur(imgd, w, h, r) {
  var i
  var pix = imgd.data
  var pixlen = pix.length

  // Split channels
  var channels = [] // rgba
  for ( i=0; i<4; i++) {
    var channel = new Uint8ClampedArray(pixlen/4);
    channels.push(channel)
  }
  for ( i = 0; i < pixlen; i += 4 ) {
    channels[0][i/4] = pix[i  ]
    channels[1][i/4] = pix[i+1]
    channels[2][i/4] = pix[i+2]
    channels[3][i/4] = pix[i+3]
  }

  channels.forEach(function(scl){
    var tcl = scl.slice(0)
    var bxs = boxesForGauss(r, 3);
    boxBlur (scl, tcl, w, h, (bxs[0]-1)/2);
    boxBlur (tcl, scl, w, h, (bxs[1]-1)/2);
    boxBlur (scl, tcl, w, h, (bxs[2]-1)/2);
    scl = tcl
  })

  // Merge channels
  for ( var i = 0, pixlen = pix.length; i < pixlen; i += 4 ) {
    pix[i  ] = channels[0][i/4]
    pix[i+1] = channels[1][i/4]
    pix[i+2] = channels[2][i/4]
    pix[i+3] = channels[3][i/4]
  }
}

// From http://blog.ivank.net/fastest-gaussian-blur.html
function boxesForGauss(sigma, n) { // standard deviation, number of boxes

  var wIdeal = Math.sqrt((12*sigma*sigma/n)+1);  // Ideal averaging filter width 
  var wl = Math.floor(wIdeal);  if(wl%2==0) wl--;
  var wu = wl+2;
  
  var mIdeal = (12*sigma*sigma - n*wl*wl - 4*n*wl - 3*n)/(-4*wl - 4);
  var m = Math.round(mIdeal);
  // var sigmaActual = Math.sqrt( (m*wl*wl + (n-m)*wu*wu - n)/12 );
      
  var sizes = [];  for(var i=0; i<n; i++) sizes.push(i<m?wl:wu);
  return sizes;
}

function boxBlur (scl, tcl, w, h, r) {
  for(var i=0; i<scl.length; i++) tcl[i] = scl[i];
  boxBlurH(tcl, scl, w, h, r);
  boxBlurT(scl, tcl, w, h, r);
}

function boxBlurH (scl, tcl, w, h, r) {
  var iarr = 1 / (r+r+1);
  for(var i=0; i<h; i++) {
    var ti = i*w, li = ti, ri = ti+r;
    var fv = scl[ti], lv = scl[ti+w-1], val = (r+1)*fv;
    for(var j=0; j<r; j++) val += scl[ti+j];
    for(var j=0  ; j<=r ; j++) { val += scl[ri++] - fv       ;   tcl[ti++] = Math.round(val*iarr); }
    for(var j=r+1; j<w-r; j++) { val += scl[ri++] - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
    for(var j=w-r; j<w  ; j++) { val += lv        - scl[li++];   tcl[ti++] = Math.round(val*iarr); }
  }
}

function boxBlurT (scl, tcl, w, h, r) {
  var iarr = 1 / (r+r+1);
  for(var i=0; i<w; i++) {
    var ti = i, li = ti, ri = ti+r*w;
    var fv = scl[ti], lv = scl[ti+w*(h-1)], val = (r+1)*fv;
    for(var j=0; j<r; j++) val += scl[ti+j*w];
    for(var j=0  ; j<=r ; j++) { val += scl[ri] - fv     ;  tcl[ti] = Math.round(val*iarr);  ri+=w; ti+=w; }
    for(var j=r+1; j<h-r; j++) { val += scl[ri] - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ri+=w; ti+=w; }
    for(var j=h-r; j<h  ; j++) { val += lv      - scl[li];  tcl[ti] = Math.round(val*iarr);  li+=w; ti+=w; }
  }
}