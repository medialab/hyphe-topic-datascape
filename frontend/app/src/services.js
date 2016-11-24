'use strict';

/* Services */

angular.module('app.services', [])
.constant('columnMeasures', {
  handle: 48,
  search: {
  	map: 50,
  	search: 35,
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

.constant('topics', [
  "surveillance_fr",
"business_media",
"surveillance_us",
"cybersecurity",
"bigdata",
"data_regulation_fr",
"cookies",
"telecom_ops_fr",
"id_fraud",
"hacking",
"terms_use",
"data_regulation_eu",
"citizen_freedom",
"cloud_security",
"data_regulation_us",
"personal_records",
"crypto_access",
"websecurity",
"copyright",
"consumer_data",
"comm_traces",
"research_it",
"health",
"social_media",
"mobile",
"data_transmission",
"education",
"airspace",
"cyberdefense",
"transports",
"bitcoin",
"wearables"
])

.factory('webentitiesService', function webentitiesServiceFactory() {
  var ns = {}
  ns._webentities = []
  ns._webentities_byId = {}
  ns._ready = false
  ns.isReady = function() { return ns._ready }

  ns.get = function(callback) {
    if (ns._ready) {
      callback(ns._webentities)
    } else {
      d3.csv('data/webentities.csv', function(data){
        ns._webentities = data
        data.forEach(function(we){
          ns._webentities_byId[we.id] = we
        })
        ns._ready = true
        callback(data)
      })
    }
  }

  ns.getIndex = function(callback) {
    if (ns._ready) {
      callback(ns._webentities_byId)
    } else {
      ns.get(function(){
        callback(ns._webentities_byId)
      })
    }
  }
  
  return ns
})

.factory('topicsService', function topicsServiceFactory() {
  var ns = {}
  ns._topics = []
  ns._topics_byId = {}
  ns._ready = false
  ns.isReady = function() { return ns._ready }

  ns.get = function(callback) {
    if (ns._ready) {
      callback(ns._webentities)
    } else {
      d3.csv('data/topics-topics.csv', function(data){
        ns._topics = data
        data.forEach(function(t){
          ns._topics_byId[t.id] = t
        })
        ns._ready = true
        callback(data)
      })
    }
  }

  ns.getIndex = function(callback) {
    if (ns._ready) {
      callback(ns._topics_byId)
    } else {
      ns.get(function(){
        callback(ns._topics_byId)
      })
    }
  }
  
  return ns
})

.value('persistance', {
  lastQuery: undefined
})