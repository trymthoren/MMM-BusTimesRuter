# MMM-BusTimesRuter
A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that displays bus times from the Entur API for Norwegian public transport (Ruter).

## Features
- Displays next bus departures from specified stop
- Shows real-time updates
- Filters for specific destination (supports both full and abbreviated names)
- Updates every minute
- Simple and clean display
- Customizable styling

## Screenshot
![MMM-BusTimesRuter Screenshot](screen1.png)

## Installation
```bash
cd ~/MagicMirror/modules
git clone https://github.com/trymthoren/MMM-BusTimesRuter.git
cd MMM-BusTimesRuter
npm install
```

## Configuration


Add this configuration to your config/config.js file:

```javascript
{
    module: "MMM-BusTimesRuter",
    position: "bottom_left",
    header: "Next Buses to Fredrikstad",
    config: {
        stopId: "NSR:StopPlace:4284",  // Borgehallen
        destination: "Fredrikstad Bussterminal",
        numberOfDepartures: 3,
        updateInterval: 60000  // Update every minute
    }
}
```
## Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `stopId` | Entur StopPlace ID | Required |
| `destination` | Destination to filter for | Required |
| `numberOfDepartures` | Number of departures to show | 3 |
| `updateInterval` | Update frequency in milliseconds | 60000 |

## Finding Stop IDs
You can find stop IDs by searching on Entur's Stop Place Register.

## Dependencies
Uses Entur's Journey Planner API v2
No API key required

## Attribution
This module uses data from Entur, Norway's National Journey Planner.

## License
MIT License
