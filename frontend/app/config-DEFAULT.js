'use strict';

/*
88888888ba                                                                                               
88      "8b                                                                           ,d                 
88      ,8P                                                                           88                 
88aaaaaa8P'  ,adPPYba,  8b,dPPYba,   ,adPPYYba,  88,dPYba,,adPYba,    ,adPPYba,     MM88MMM  ,adPPYba,   
88""""88'   a8P_____88  88P'   `"8a  ""     `Y8  88P'   "88"    "8a  a8P_____88       88    a8"     "8a  
88    `8b   8PP"""""""  88       88  ,adPPPPP88  88      88      88  8PP"""""""       88    8b       d8  
88     `8b  "8b,   ,aa  88       88  88,    ,88  88      88      88  "8b,   ,aa       88,   "8a,   ,a8"  
88      `8b  `"Ybbd8"'  88       88  `"8bbdP"Y8  88      88      88   `"Ybbd8"'       "Y888  `"YbbdP"'   
                                                                                                         
                                                                                                         
                                                                                                         
88 88                                        ad88  88                    88           88 88              
88 88                                       d8"    ""                    ""           88 88              
"" ""                                       88                                        "" ""              
      ,adPPYba,   ,adPPYba,   8b,dPPYba,  MM88MMM  88   ,adPPYb,d8       88  ,adPPYba,                   
     a8"     ""  a8"     "8a  88P'   `"8a   88     88  a8"    `Y88       88  I8[    ""                   
     8b          8b       d8  88       88   88     88  8b       88       88   `"Y8ba,                    
     "8a,   ,aa  "8a,   ,a8"  88       88   88     88  "8a,   ,d88  888  88  aa    ]8I                   
      `"Ybbd8"'   `"YbbdP"'   88       88   88     88   `"YbbdP"Y8  888  88  `"YbbdP"'                   
                                                        aa,    ,88      ,88                              
                                                         "Y8bbdP"     888P"               
*/


angular.module('app.config', [])

// EDIT REQUIRED: it will not work unless you use your own endpoint URL
.constant('solrEndpoint', 'http://example.com/solr/endpoint/')

.constant('datascapeTitle', 'Datascape')
.constant('datascapeLogos', [])	// Add one or more logo paths. Example: 'res/logo.png'