const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
   start: function() {
       console.log("Starting node helper for: MMM-BusTimesRuter");
   },

   socketNotificationReceived: function(notification, payload) {
       if (notification === "GET_DEPARTURES") {
           console.log("Received request for departures:", payload);
           this.fetchDepartures(payload);
       }
   },

   fetchDepartures: function(config) {
       console.log("Fetching departures for stop:", config.stopId);
       
       const requestData = JSON.stringify({
           query: `{
               stopPlace(id: "${config.stopId}") {
                   id
                   name
                   estimatedCalls(numberOfDepartures: ${config.numberOfDepartures}) {
                       expectedDepartureTime
                       destinationDisplay {
                           frontText
                       }
                       serviceJourney {
                           line {
                               publicCode
                           }
                       }
                   }
               }
           }`
       });

       const options = {
           hostname: 'api.entur.io',
           path: '/journey-planner/v3/graphql',
           method: 'POST',
           headers: {
               'ET-Client-Name': 'trymthoren-magicmirror-bustimesruter',
               'Content-Type': 'application/json',
               'Accept': 'application/json',
               'Content-Length': requestData.length,
               'Cache-Control': 'no-cache',
               'ET-Client-ID': 'trymthoren-magicmirror-bustimesruter'
           }
       };

       const req = https.request(options, (res) => {
           let data = '';
           res.on('data', (chunk) => {
               data += chunk;
           });

           res.on('end', () => {
               try {
                   console.log("Raw response:", data);
                   const jsonData = JSON.parse(data);
                   console.log("Parsed response:", JSON.stringify(jsonData, null, 2));
                   if (jsonData.data && jsonData.data.stopPlace && jsonData.data.stopPlace.estimatedCalls) {
                       const departures = jsonData.data.stopPlace.estimatedCalls
                           .filter(call => {
                               const dest = call.destinationDisplay.frontText.toLowerCase();
                               const configDest = config.destination.toLowerCase();
                               const configDestShort = config.destinationShort.toLowerCase();
                               return dest.includes(configDest) || dest.includes(configDestShort);
                           })
                           .map(call => ({
                               expectedDepartureTime: call.expectedDepartureTime,
                               lineNumber: call.serviceJourney.line.publicCode,
                               destination: call.destinationDisplay.frontText
                           }));
                       
                       console.log("Processed departures:", departures);
                       this.sendSocketNotification("DEPARTURES_RESULT", departures);
                   } else {
                       console.error("Invalid API response structure:", jsonData);
                   }
               } catch (error) {
                   console.error("Error parsing departures:", error);
                   console.error("Raw data received:", data);
               }
           });
       });

       req.on('error', (error) => {
           console.error("Error making request:", error);
       });

       req.write(requestData);
       req.end();
   }
});
