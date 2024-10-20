import fs from 'fs';

const filePath = './user_inputs.json';
const readDataFromFile = () => {
  if (!fs.existsSync(filePath)) {
    return { total_emissions: 0, celebrities: {} };
  }
  const rawData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawData);
};

const writeDataToFile = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};


const calculateCO2ForWalking = (steps) => {
  const metersPerStep = 0.762; 
  const distanceInKm = (steps * metersPerStep) / 1000; 
  const co2PerKm = 0.404; 
  return { distance: distanceInKm, co2Saved: distanceInKm * co2PerKm };
};

const calculateCO2ForOther = (distance, mode) => {
  let co2Saved = 0;
  if (mode === 'public transport') {
    co2Saved = distance * 0.056; 
  } else if (mode === 'bike') {
    co2Saved = distance * 0.21;
  }
  return co2Saved;
};

const saveUserData = (celebrity, mode, distanceOrSteps) => {
  let data = readDataFromFile();
  let distance, co2Saved;

  if (mode === 'steps') {
    const result = calculateCO2ForWalking(distanceOrSteps);
    distance = result.distance;
    co2Saved = result.co2Saved;
  } else {
    distance = distanceOrSteps;
    co2Saved = calculateCO2ForOther(distanceOrSteps, mode);
  }

  if (!data.celebrities[celebrity]) {
    data.celebrities[celebrity] = {
      total_emissions: 0,
      transportation: [] 
    };
  }

  data.celebrities[celebrity].total_emissions += co2Saved;

  if (!data.celebrities[celebrity].transportation) {
    data.celebrities[celebrity].transportation = [];
  }

  data.celebrities[celebrity].transportation.push({
    mode_of_transportation: mode,
    distance_traveled: distance,
    carbon_emission_saved: co2Saved
  });

  data.total_emissions += co2Saved;

  writeDataToFile(data);
};
