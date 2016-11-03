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
  wes: { // webentities
  	map: 50,
  	wes: 50
  },
  topics: {
  	topics: 80,
  	side: 20
  },
  verbatim: {
  	mapwe: 25,
  	map: 40,
  	verbatim: 60,
  	topics: 15
  },
  we: {
  	we: 75,
  	map: 40,
  	mapdocs: 25
  },
  topic: {
  	topic: 100
  }
})

.factory('topics', function topicsFactory() {
  return [
  	{name: "Hacking", id: "hacking"},
  	{name: "Big Data", id: "bigdata"},
  	{name: "Bitcoin", id: "bitcoin"}
  ];
})

