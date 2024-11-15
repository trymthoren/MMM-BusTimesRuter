Module.register("MMM-BusTimesRuter", {
    defaults: {
        stopId: "NSR:StopPlace:4284", // Borgehallen
        destination: "Fredrikstad Bussterminal",
        numberOfDepartures: 3,
        updateInterval: 60000 // Update every minute
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.departures = [];
        this.loaded = false;
        this.getDepartures();
        setInterval(() => this.getDepartures(), this.config.updateInterval);
    },

    getStyles: function () {
        return ["MMM-BusTimesRuter.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "MMM-BusTimesRuter";

        if (!this.loaded) {
            wrapper.innerHTML = "Loading departures...";
            return wrapper;
        }

        if (!this.departures.length) {
            wrapper.innerHTML = "No departures found";
            return wrapper;
        }

        this.departures.forEach((departure) => {
            const departureElement = document.createElement("div");
            departureElement.className = "departure";
            const time = new Date(departure.expectedDepartureTime).toLocaleTimeString("no-NO", {
                hour: "2-digit",
                minute: "2-digit"
            });
            departureElement.innerHTML = `${time} - Bus ${departure.lineNumber} to ${departure.destination}`;
            wrapper.appendChild(departureElement);
        });

        return wrapper;
    },

    getDepartures: function () {
        this.sendSocketNotification("GET_DEPARTURES", {
            stopId: this.config.stopId,
            numberOfDepartures: this.config.numberOfDepartures,
            destination: this.config.destination
        });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "DEPARTURES_RESULT") {
            this.departures = payload;
            this.loaded = true;
            this.updateDom();
        }
    }
});
