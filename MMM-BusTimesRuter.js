Module.register("MMM-BusTimesRuter", {
    defaults: {
        updateInterval: 60000,
        stopId: "",
        numberOfDepartures: 3,
        destination: ""
    },

    start: function() {
        this.departures = [];
        this.loaded = false;
        this.scheduleUpdate();
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "MMM-BusTimesRuter";

        // Add header
        const header = document.createElement("div");
        header.className = "module-header";
        header.innerHTML = `Next bus to ${this.config.destination}`;
        wrapper.appendChild(header);

        if (!this.loaded) {
            const loading = document.createElement("div");
            loading.className = "no-departures";
            loading.innerHTML = "Loading...";
            wrapper.appendChild(loading);
            return wrapper;
        }

        if (this.departures.length === 0) {
            const noDepartures = document.createElement("div");
            noDepartures.className = "no-departures";
            noDepartures.innerHTML = "No departures found";
            wrapper.appendChild(noDepartures);
            return wrapper;
        }

        this.departures.forEach(departure => {
            const departureTime = new Date(departure.expectedDepartureTime);
            const now = new Date();
            const minutesUntil = Math.round((departureTime - now) / 60000);

            const departureDiv = document.createElement("div");
            departureDiv.className = "departure";

            // Time
            const timeDiv = document.createElement("div");
            timeDiv.className = "time";
            timeDiv.innerHTML = departureTime.toLocaleTimeString('no-NO', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            // Line number
            const lineDiv = document.createElement("div");
            lineDiv.className = "line-number";
            lineDiv.innerHTML = departure.lineNumber;

            // Destination and minutes
            const destDiv = document.createElement("div");
            destDiv.className = "destination";
            destDiv.innerHTML = `${departure.destination} | ${minutesUntil} min`;

            departureDiv.appendChild(timeDiv);
            departureDiv.appendChild(lineDiv);
            departureDiv.appendChild(destDiv);
            wrapper.appendChild(departureDiv);
        });

        return wrapper;
    },

    getStyles: function() {
        return [
            "MMM-BusTimesRuter.css"
        ];
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.sendSocketNotification("GET_DEPARTURES", this.config);
        }, this.config.updateInterval);
        this.sendSocketNotification("GET_DEPARTURES", this.config);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "DEPARTURES_RESULT") {
            this.departures = payload;
            this.loaded = true;
            this.updateDom();
        }
    },
});
