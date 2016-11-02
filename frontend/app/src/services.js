'use strict';

/* Services */

angular.module('app.services', [])
.constant('columnMeasures', {
  handle: 48,
  search: {
  	map: 50,
  	search: 30,
  	topics: 15
  },
  we: { // webentities
  	map: 50,
  	we: 50
  },
  topics: {
  	topics: 100
  }
})

