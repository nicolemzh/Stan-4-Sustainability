import fs from 'fs';
import express from 'express';
const app = express();

app.get('/statistics', (req, res) => {

  const data = JSON.parse(fs.readFileSync('user_inputs.json', 'utf8'));
  const statistics = {};

  for (const celebrity in data.celebrities) {
    const celebrityData = data.celebrities[celebrity];

    let totalSteps = 0;
    const foodCount = {};

    celebrityData.transportation.forEach(transport => {
      if (transport.mode_of_transportation === 'steps') {
        totalSteps += transport.distance_traveled; 
      }
    });

    celebrityData.products.forEach(product => {
      const productName = product.product_name;
      foodCount[productName] = (foodCount[productName] || 0) + 1;
    });

    let mostPopularFood = '';
    let maxCount = 0;
    for (const food in foodCount) {
      if (foodCount[food] > maxCount) {
        mostPopularFood = food;
        maxCount = foodCount[food];
      }
    }

    statistics[celebrity] = {
      totalSteps: totalSteps,
      mostPopularFood: mostPopularFood
    };
  }

  res.json(statistics);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
