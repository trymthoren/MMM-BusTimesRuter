const NodeHelper = require("node_helper");
const https = require("https");

module.exports = NodeHelper.create({
    start: function () {
        console.log("Starting node helper for: MMM-BusTimesRuter");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_DEPARTURES") {
            this.fetchDepartures(payload);
        }
    },

    fetchDepartures: function (config) {
        const query = {
            query: `{
                stopPlace(id: "${config.stopId}") {
                    name
                    estimatedCalls(numberOfDepartures: ${config.numberOfDepartures}, whiteListed: {modes: [bus]}) {
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
        };

        const options = {
            hostname: 'api.entur.io',
            path: '/journey-planner/v2/graphql',
            method: 'POST',
            headers: {
                'ET-Client-Name': 'MMM-BusTimesRuter',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    const departures = jsonData.data.stopPlace.estimatedCalls
                        .filter(call => call.destinationDisplay.frontText.includes(config.destination))
                        .map(call => ({
                            expectedDepartureTime: call.expectedDepartureTime,
                            lineNumber: call.serviceJourney.line.publicCode,
                            destination: call.destinationDisplay.frontText
                        }));
                    this.sendSocketNotification("DEPARTURES_RESULT", departures);
                } catch (error) {
                    console.error("Error parsing departures:", error);
                }
            });
        });

        req.on('error', (error) => {
            console.error("Error fetching departures:", error);
        });

        req.write(JSON.stringify(query));
        req.end();
    }
});
