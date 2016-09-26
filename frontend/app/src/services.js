'use strict';

/* Services */

angular.module('app.services', [])

// Facets declaration
// FIXME: adapt this to the actual data of this project (this is an artifact from the template project)
.factory('Facets', function ( wellBeingAspects ,  regionsMetadata ) {
  // Namespace
  var ns = {};
  
  // Facettage.debug = true;

  // Retrieve data from cache
  ns.coeffs = Facettage.newFacet('coefficients.csv', {
    cached: true,
    type: 'csv',
    unserialize: function (data) {
      return data.map( function (d) {
        wellBeingAspects.forEach( function (key) {
          d[key] = Number(d[key]);
        });
        return d;
      })
    }
  })

  ns.getSeries = function (country, region, topic) {
    // The name is an id as well as the path in the data cache
    // FIXME: the '/'' may not be the right path separator
    var name = region + '_' + topic + '.csv';
    // Require a facet (ie. create or get already created)
    return Facettage.requireFacet(name, {
      cached: true,
      /**
       * We use csvRows instead of csv because the first line
       * is not a header
       */
      type: 'csvRows',
      unserialize: function (data) {
        // Remove header
        data.shift();
        // Parse as numbers
        return data.map(Number);
      }
    });
  }

  return ns;
})