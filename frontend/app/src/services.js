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
  "airspace",
  "bigdata",
  "bitcoin",
  "business_media",
  "transports",
  "id_fraud",
  "cloud_security",
  "comm_traces",
  "consumer_data",
  "cookies",
  "copyright",
  "crypto_access",
  "cyberdefense",
  "cybersecurity",
  "data_regulation_eu",
  "data_regulation_fr",
  "data_regulation_us",
  "data_transmission",
  "education",
  "citizen_freedom",
  "hacking",
  "health",
  "mobile",
  "personal_records",
  "research_it",
  "social_media",
  "surveillance_fr",
  "surveillance_us",
  "telecom_ops_fr",
  "terms_use",
  "wearables",
  "websecurity"
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
          ns._webentities_byId[we.ID] = we
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