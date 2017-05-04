'use strict';

angular.module('app.network', ['ngRoute', 'ngMaterial'])

.config(function($routeProvider) {
  $routeProvider.when('/network', {
    templateUrl: 'src/views/network.html'
  , controller: 'NetworkController'
  })
})

.controller('NetworkController', function(
  $scope,
  $location,
  $window,
  $translate,
  $translatePartialLoader,
  $timeout,
  $mdColors,
  $routeParams,
) {
  $scope.pending = true;
  var sigmaInstance

  $scope.spatializationRunning = true;

  // Sigma stuff
  $scope.$on("$destroy", () => {
    killSigma();
  });

  $scope.sigmaRecenter = function  (){
    var c = sigmaInstance.cameras[0];
    c.goTo({
      ratio: 1,
      x: 0,
      y: 0,
    });
  }

  $scope.sigmaZoom = function () {
    var c = sigmaInstance.cameras[0];
    c.goTo({
      ratio: c.ratio / c.settings('zoomingRatio')
    });
  }

  $scope.sigmaUnzoom = function () {
    var c = sigmaInstance.cameras[0];
    c.goTo({
      ratio: c.ratio * c.settings('zoomingRatio')
    })
  }

  $scope.toggleSpatialization = function () {
    if ($scope.spatializationRunning) {
      sigmaInstance.stopForceAtlas2();
      $scope.spatializationRunning = false;
    } else {
      sigmaInstance.startForceAtlas2();
      $scope.spatializationRunning = true;
    }
  }

  $scope.runSpatialization = function () {
    $scope.spatializationRunning = true;
    sigmaInstance.startForceAtlas2();
  }

  $scope.stopSpatialization = function () {
    $scope.spatializationRunning = false;
    if (sigmaInstance) {
      sigmaInstance.killForceAtlas2();
    }
  }

  initSigma()

  function initSigma () {

    sigma.parsers.gexf(
      'data/network.gexf',
      {
        container: 'sigma',
        settings: {
          font: 'Roboto',
          defaultLabelColor: '#666',
          edgeColor: 'default',
          defaultEdgeColor: '#ECE8E5',
          defaultNodeColor: '#999',
          minNodeSize: 2,
          maxNodeSize: 10,
          zoomMax: 5,
          zoomMin: 0.002,
          labelThreshold: 6
        }
      },
      function(s){

        sigmaInstance = s

        // For debugging purpose
        $window.s = sigmaInstance;

        // Force Atlas 2 settings
        sigmaInstance.configForceAtlas2({
          slowDown: 2 * (1 + Math.log(sigmaInstance.graph.nodes().length)),
          worker: true,
          scalingRatio: 10,
          strongGravityMode: true,
          gravity: 0.1,
          barnesHutOptimize: sigmaInstance.graph.nodes().length > 1000,
        });

        // Bind interactions
        sigmaInstance.bind('overNode', e => {
          if (Object.keys(e.data.captor).length > 0) {  // Sigma bug turnaround
            $scope.overNode = true;
            $scope.$apply();
          }
        });

        sigmaInstance.bind('outNode', e => {
          if (Object.keys(e.data.captor).length > 0) {  // Sigma bug turnaround
            $scope.overNode = false;
            $scope.$apply();
          }
        });

        sigmaInstance.bind('clickNode', e => {
          // TODO: do something on node click
          // let path = '...';
          // $window.open(path, '_blank');
        });

        sigmaInstance.refresh()
        // $scope.runSpatialization();

      }
    )
  }

  function killSigma(){
    if (sigmaInstance) {
      $scope.stopSpatialization();
      sigmaInstance.kill();
    }
  }

})
