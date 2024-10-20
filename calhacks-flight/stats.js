const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3007;
const cors = require('cors');
app.use(cors());

function findMostPopularProduct(celebProducts) {
    if (celebProducts.length === 0) return "No Data Available :(";
    const productCount = {};
    celebProducts.forEach(product => {
        if (!productCount[product.product_name]) {
            productCount[product.product_name] = 0;
        }
        productCount[product.product_name]++;
    });
    let mostPopularProduct = null;
    let maxCount = 0;
    for (const [productName, count] of Object.entries(productCount)) {
        if (count > maxCount) {
            maxCount = count;
            mostPopularProduct = productName;
        }
    }
    return mostPopularProduct || "No Data Available :(";
}

function calculateTotalSteps(celebTransportation) {
    if (!celebTransportation || celebTransportation.length === 0) return "No Data Available :(";
    const totalSteps = celebTransportation.reduce((sum, transport) => {
        if (transport.mode_of_transportation === 'steps') {
            return sum + transport.distance_traveled;
        }
        return sum;
    }, 0);
    return totalSteps > 0 ? totalSteps : "No Data Available :(";
}

app.get('/api/fan-data', async (req, res) => {
    try {
        // Fetch the data from http://localhost:3003/total_emissions
        const response = await axios.get('http://localhost:3003/total_emissions');
        const data = response.data;  // The data from the external API

        // Process the data to calculate fan data
        const fanData = {};
        for (const [celebrity, celebData] of Object.entries(data.celebrities)) {
            const mostPopularProduct = findMostPopularProduct(celebData.products || []);
            const totalSteps = calculateTotalSteps(celebData.transportation || []);
            fanData[celebrity] = {
                mostPopularProduct,
                totalSteps
            };
        }

        // Return all celebrities, even those without products or steps
        res.json(fanData);

    } catch (error) {
        console.error('Error fetching data from total_emissions:', error);
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
