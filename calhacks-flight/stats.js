import fs from 'fs';
import express from 'express';
const app = express();

app.get('/statistics', (req, res) => {
  // Load the JSON file
  const data = JSON.parse(fs.readFileSync('user_inputs.json', 'utf8'));

  // Initialize an object to store the statistics
  const statistics = {};

  // Loop through each celebrity in the data
  for (const celebrity in data.celebrities) {
    const celebrityData = data.celebrities[celebrity];

    let totalSteps = 0;
    const foodCount = {};

    // Loop through each transportation entry
    celebrityData.transportation.forEach(transport => {
      if (transport.mode_of_transportation === 'steps') {
        totalSteps += transport.distance_traveled; // Sum total steps walked
      }
    });

    // Loop through each product to track the most popular food
    celebrityData.products.forEach(product => {
      const productName = product.product_name;
      foodCount[productName] = (foodCount[productName] || 0) + 1; // Count occurrences of each product
    });

    // Find the most popular food
    let mostPopularFood = '';
    let maxCount = 0;
    for (const food in foodCount) {
      if (foodCount[food] > maxCount) {
        mostPopularFood = food;
        maxCount = foodCount[food];
      }
    }

    // Store the statistics for the current celebrity
    statistics[celebrity] = {
      totalSteps: totalSteps,
      mostPopularFood: mostPopularFood
    };
  }

  // Send the processed statistics to the frontend
  res.json(statistics);
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
