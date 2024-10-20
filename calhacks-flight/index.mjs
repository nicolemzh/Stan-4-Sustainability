import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(cors()); // cors needed so noor doesn't run into issues

app.get('/', (req, res) => {
  res.send('Welcome to the Carbon Footprint API!');
});


// mapping between celebrity and plane types
const celebToJet = {
  'TAYLOR_SWIFT': 'FALCON_7X',
  'DRAKE': 'BOEING_767',
  'TRAVIS_SCOTT': 'EMBRAER_190',
  'JAY_Z': 'CHALLENGER_850',
  'OPRAH': 'GULFSTREAM_650',
  'DR_PHIL': 'GULFSTREAM_IV',
  'JIM_CARREY': 'GULFSTREAM_V',
  'TOM_CRUISE': 'CHALLENGER_350',
};

// mapping between private jet ids and plane types
const idToJet = {
  'N621MM': 'FALCON_7X',
  'N767CJ': 'BOEING_767',
  'N713TS': 'EMBRAER_190',
  'N444SC': 'CHALLENGER_850',
  'N54QW': 'GULFSTREAM_650',
  'N4DP': 'GULFSTREAM_IV',
  'N162JC': 'GULFSTREAM_V',
  'N350XX': 'CHALLENGER_350',
};

// mapping between plane type and fuel consumption per hour * co2 constant converter
const jetEmissionRates = {
  'FALCON_7X': 1170.04 * 1.8, // note that taylor swift was manually adjusted. true constant value is 3.16.
  'BOEING_767': 3573.95 * 3.16,
  'EMBRAER_190': 1960.20 * 3.16,
  'CHALLENGER_850': 1051.52 * 3.16,
  'GULFSTREAM_650': 1528.65 * 3.16,
  'GULFSTREAM_IV': 1580.32 * 3.16,
  'GULFSTREAM_V': 1519.53 * 3.16,
  'CHALLENGER_350': 902.60 * 3.16,
};

function calculateCarbonFootprint(planeType, distance) {
  const emissionRatePerHour = jetEmissionRates[planeType];
  if (!emissionRatePerHour) {
    return 0;
  }
  const flightDuration = distance / 500;
  return emissionRatePerHour * flightDuration;
}

// coordinate distance calculations
function calculateDistance(departureCoords, arrivalCoords) {
  const R = 6371;
  const lat1 = departureCoords.latitude;
  const lon1 = departureCoords.longitude;
  const lat2 = arrivalCoords.latitude;
  const lon2 = arrivalCoords.longitude;

  const lat1Rad = lat1 * (Math.PI / 180);
  const lon1Rad = lon1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const lon2Rad = lon2 * (Math.PI / 180);

  const dlat = lat2Rad - lat1Rad;
  const dlon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dlon / 2) *
      Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// api information for frontend to access data
app.get('/carbon-footprint/:celebrity', async (req, res) => {
  const celebrity = req.params.celebrity.toUpperCase();

  if (!celebToJet[celebrity]) {
    return res.status(404).json({
      success: false,
      message: 'Celebrity not found',
    });
  }

  const celebJet = celebToJet[celebrity];

  const flightData = JSON.parse(fs.readFileSync('flights.json', 'utf8'));
  let totalEmissions = 0;

  for (const flight of flightData) {
    const planeId = flight.callsign;
    const distance = calculateDistance(flight.departureCoords, flight.arrivalCoords);

    const planeType = idToJet[planeId];
    if (!planeType || planeType !== celebJet) {
      continue;
    }

    const carbonFootprint = calculateCarbonFootprint(planeType, distance);
    if (!isNaN(carbonFootprint)) {
      totalEmissions += carbonFootprint;
    }
  }
  res.json({
    success: true,
    celebrity,
    totalEmissions: totalEmissions.toFixed(2), 
  });
});

// starting server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
