'use strict';

/* Services */

angular.module('app.filters', [])

  .filter('prettyDate', [function() {
    return function(timestamp) {
      return prettyDate(timestamp)
      
      function prettyDate(date) {
        // Code adapted from http://webdesign.onyou.ch/2010/08/04/javascript-time-ago-pretty-date/
        var time_formats = [
          [60, 'just now', 'just now'],                 // 60
          [120, '1 minute ago', '1 minute from now'],   // 60*2
          [3600, 'minutes', 60],                        // 60*60, 60
          [7200, '1 hour ago', '1 hour from now'],      // 60*60*2
          [86400, 'hours', 3600],                       // 60*60*24, 60*60
          [172800, 'yesterday', 'tomorrow'],            // 60*60*24*2
          [604800, 'days', 86400],                      // 60*60*24*7, 60*60*24
          [1209600, 'last week', 'next week'],          // 60*60*24*7*4*2
          [2419200, 'weeks', 604800],                   // 60*60*24*7*4, 60*60*24*7
          [4838400, 'last month', 'next month'],        // 60*60*24*7*4*2
          [29030400, 'months', 2419200],                // 60*60*24*7*4*12, 60*60*24*7*4
          [58060800, 'last year', 'next year'],         // 60*60*24*7*4*12*2
          [2903040000, 'years', 29030400],              // 60*60*24*7*4*12*100, 60*60*24*7*4*12
          [5806080000, 'last century', 'next century'], // 60*60*24*7*4*12*100*2
          [58060800000, 'centuries', 2903040000]        // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
        ]
        ,seconds = (new Date() - date) / 1000
        ,token = 'ago'
        ,list_choice = 1
        if (seconds < 0) {
          seconds = Math.abs(seconds)
          token = 'from now'
          list_choice = 2
        }
        var i = 0, format
        while (format = time_formats[i++]){
          if (seconds < format[0]) {
            if (typeof(format[2]) == 'string'){
              return format[list_choice]
            } else {
              return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token
            }
          }
        }
        return date
      }
    }
  }])

  .filter('sortEntities', [function() {
    return function(list, crit, ppe) {
      var output = list.slice(0)
      switch(crit) {
        case 'degree':
          output.sort(function(a, b){
            return b['weighted degree'] - a['weighted degree']
          })
          break

        case 'indegree':
          output.sort(function(a, b){
            return b['weighted indegree'] - a['weighted indegree']
          })
          break

        case 'outdegree':
          output.sort(function(a, b){
            return b['weighted outdegree'] - a['weighted outdegree']
          })
          break

        case 'betweenness':
          output.sort(function(a, b){
            return b['betweenesscentrality'] - a['betweenesscentrality']
          })
          break

        case 'pages':
          output.sort(function(a, b){
            return ppe[b.id] - ppe[a.id]
          })
          break

        case 'name':
          output.sort(function(a, b){
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0;
          })
          break

        default:
          // Nothing
          break;
      }
      return output
    }
  }])

  .filter('filterEntities', [function() {
    return function(list, ppe, q) {
      return list.filter(function(we){
        if (ppe[we.id] === undefined) {
          if (q) return false
          else return true
        } else return ppe[we.id] > 0
      })
    }
  }])