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
