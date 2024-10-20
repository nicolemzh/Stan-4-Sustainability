import fs from 'fs';

// Path to your user_inputs.json file
const filePath = './user_inputs.json';

// Utility function to read the JSON file
const readDataFromFile = () => {
  if (!fs.existsSync(filePath)) {
    return { total_emissions: 0, celebrities: {} };
  }
  const rawData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(rawData);
};

// Utility function to write updated data to the JSON file
const writeDataToFile = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Function to calculate CO2 saved by walking (steps)
const calculateCO2ForWalking = (steps) => {
  const metersPerStep = 0.762; // Average step length in meters
  const distanceInKm = (steps * metersPerStep) / 1000; // Convert to kilometers
  const co2PerKm = 0.404; // kg of CO2 saved per km (compared to driving)
  return { distance: distanceInKm, co2Saved: distanceInKm * co2PerKm };
};

// Function to calculate CO2 saved by public transport or biking
const calculateCO2ForOther = (distance, mode) => {
  let co2Saved = 0;
  if (mode === 'public transport') {
    co2Saved = distance * 0.056; // kg CO2 saved per km for public transport
  } else if (mode === 'bike') {
    co2Saved = distance * 0.21; // kg CO2 saved per km for biking
  }
  return co2Saved;
};

// Function to save user data
const saveUserData = (celebrity, mode, distanceOrSteps) => {
  let data = readDataFromFile();
  let distance, co2Saved;

  // Calculate CO2 saved based on mode
  if (mode === 'steps') {
    const result = calculateCO2ForWalking(distanceOrSteps);
    distance = result.distance;
    co2Saved = result.co2Saved;
  } else {
    distance = distanceOrSteps;
    co2Saved = calculateCO2ForOther(distanceOrSteps, mode);
  }

  // Check if celebrity exists, and if not, initialize with default values
  if (!data.celebrities[celebrity]) {
    data.celebrities[celebrity] = {
      total_emissions: 0,
      transportation: []  // Initialize transportation field as an empty array
    };
  }

  // Update celebrity's total emissions
  data.celebrities[celebrity].total_emissions += co2Saved;

  // Ensure the transportation field is initialized
  if (!data.celebrities[celebrity].transportation) {
    data.celebrities[celebrity].transportation = [];
  }

  // Add new transportation entry (mode, distance, CO2 saved)
  data.celebrities[celebrity].transportation.push({
    mode_of_transportation: mode,
    distance_traveled: distance,
    carbon_emission_saved: co2Saved
  });

  // Update the global total emissions
  data.total_emissions += co2Saved;

  // Write the updated data back to the file
  writeDataToFile(data);
};

// Example function calls based on user input from frontend
// For steps
saveUserData('taylor', 'steps', 10000);  // 10,000 steps example

// For public transport
saveUserData('taylor', 'public transport', 15);  // 15 km example

// For biking
saveUserData('taylor', 'bike', 20);  // 20 km example
