const fs = require('fs');
// randomly generates flight info (for the time being while flight historical data is unavailable)
// list of known private jet ids
const predefinedCallsigns = [
  'N621MM', 'N767CJ', 'N713TS', 'N444SC', 'N54QW', 'N4DP', 'N162JC', 'N350XX'
];

const airports = {
  JFK: { latitude: 40.6413, longitude: -73.7781 }, 
  LAX: { latitude: 33.9416, longitude: -118.4085 }, 
  ORD: { latitude: 41.9742, longitude: -87.9073 }, 
  DFW: { latitude: 32.8998, longitude: -97.0403 }, 
  DEN: { latitude: 39.7392, longitude: -104.9903 }, 
  SFO: { latitude: 37.7749, longitude: -122.4194 }, 
  SEA: { latitude: 47.6062, longitude: -122.3321 }, 
  MIA: { latitude: 25.7617, longitude: -80.1918 }, 
  ATL: { latitude: 33.6407, longitude: -84.4279 }, 
  LAS: { latitude: 36.0801, longitude: -115.1523 },
  BOS: { latitude: 42.3656, longitude: -71.0096 },
  PHX: { latitude: 33.4342, longitude: -112.0131 }
};

const getRandomCallsign = () => {

  return Math.random() < 0.3
    ? 'N621MM'
    : predefinedCallsigns[Math.floor(Math.random() * predefinedCallsigns.length)];
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const generateFlightData = (numFlights) => {
  return Array.from({ length: numFlights }, () => {
    let departureAirport, arrivalAirport;
    let distance = 0;
    do {
      departureAirport = Object.keys(airports)[Math.floor(Math.random() * Object.keys(airports).length)];
      arrivalAirport = Object.keys(airports)[Math.floor(Math.random() * Object.keys(airports).length)];
      
      const departureCoords = airports[departureAirport];
      const arrivalCoords = airports[arrivalAirport];
      distance = calculateDistance(
        departureCoords.latitude, departureCoords.longitude,
        arrivalCoords.latitude, arrivalCoords.longitude
      );
    } while (distance > 5000);

    const departureCoords = airports[departureAirport];
    const arrivalCoords = airports[arrivalAirport];
    const callsign = getRandomCallsign();

    return { 
      departureCoords,
      arrivalCoords, 
      callsign, 
      departureAirport, 
      arrivalAirport 
    };
  });
};

// generates 500 flights
const flightData = generateFlightData(500);
fs.writeFileSync('flights.json', JSON.stringify(flightData, null, 2), 'utf8');
console.log('500 flights with bias towards N621MM and normal distances have been written to flights.json');
