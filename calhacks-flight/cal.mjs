import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const app = express();
app.use(express.json());

const jsonFile = 'user_inputs.json';

async function readJson() {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        const parsedData = JSON.parse(data);
        
        // Ensure that both total_emissions and products are initialized
        if (!parsedData.total_emissions) {
            parsedData.total_emissions = 0;
        }
        if (!parsedData.products) {
            parsedData.products = [];
        }

        return parsedData;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file not found, initialize with zero emissions and an empty product list
            return { total_emissions: 0, products: [] };
        }
        throw error;
    }
}


async function writeJson(data) {
    await fs.writeFile(jsonFile, JSON.stringify(data, null, 2));
}

async function searchEmissionFactor(query) {
    const climatiqSearchUrl = 'https://api.climatiq.io/data/v1/search';
    const climatiqHeaders = {
        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`
    };
    console.log(query);

    try {
        const response = await axios.get(climatiqSearchUrl, {
            headers: climatiqHeaders,
            params: {
                query: query,  // Free text search from Open Food Facts category or product name
                results_per_page: 1,  // Limit to the best match
                data_version: "18"  // Specify the data version
            }
        });

        if (response.data.results.length > 0) {
            const firstResult = response.data.results[0];

            const activityId = firstResult.activity_id || null;
            const unit = firstResult.unit || 'Unknown unit';
            const unit_type = firstResult.unit_type || 'Unknown unit type';

            return { activityId, unit, unit_type };
        } else {
            return null;  // No emission factor found
        }

    } catch (error) {
        console.error('Error searching for emission factor:', error);
        return null;
    }
}

async function estimateEmissions(activityId, parameters) {
    const climatiqEstimateUrl = 'https://api.climatiq.io/data/v1/estimate';
    const climatiqHeaders = {
        'Authorization': `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(climatiqEstimateUrl, {
            emission_factor: {
                activity_id: activityId,
                data_version: "18"  // Specify the data version
            },
            parameters: parameters
        }, { headers: climatiqHeaders });

        return response.data.co2e;  // Return the estimated emissions in kgCO2e

    } catch (error) {
        console.error('Error estimating emissions:', error);
        return 0;  // Return zero if there was an error
    }
}

app.get('/calculate_emissions/:barcode/:celebrity', async (req, res) => {
    const { barcode, celebrity } = req.params;

    try {
        // 1. Fetch product data from Open Food Facts API
        const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const openFoodFactsResponse = await axios.get(openFoodFactsUrl);

        if (openFoodFactsResponse.data.status === 0) {
            return res.status(404).json({ error: "Product not found in Open Food Facts" });
        }

        const product = openFoodFactsResponse.data.product || {};
        const productCategory = product.categories || 'Unknown';
        const productName = product.product_name || 'Unknown';
        let fdcCat = 'Unknown';
        if (product.sources_fields && product.sources_fields['org-database-usda']) {
            fdcCat = product.sources_fields['org-database-usda'].fdc_category || 'Unknown';
        }

        // 2. Search for the emission factor based on product category or name
        const searchQuery = fdcCat;
        const { activityId, unit, unit_type } = await searchEmissionFactor(searchQuery);

        if (!activityId) {
            return res.status(404).json({ error: "Emission factor not found" });
        }

        // 3. Estimate the carbon emissions using the activity ID and relevant parameters
        const parameters = {
            [unit_type.toLowerCase()]: 1,  // Example: 1 unit of product (you can adapt this)
            [`${unit_type.toLowerCase()}_unit`]: 'usd'  // Adjust based on product type, e.g., 'kg', 'kWh', etc.
        };
        const emissions = await estimateEmissions(activityId, parameters);

        // 4. Store product info and total emissions in JSON file
        const data = await readJson();  // Load JSON file

        // Ensure the celebrity exists in the data
        if (!data.celebrities) {
            data.celebrities = {};
        }
        if (!data.celebrities[celebrity]) {
            data.celebrities[celebrity] = { total_emissions: 0, products: [] };
        }

        // Update celebrity's total emissions and product list
        data.celebrities[celebrity].total_emissions += emissions;
        data.celebrities[celebrity].products.push({
            barcode: barcode,
            product_name: productName,
            category: productCategory,
            carbon_emission: emissions
        });

        // Update total emissions for all celebrities
        if (!data.total_emissions) {
            data.total_emissions = 0;
        }
        data.total_emissions += emissions;

        // Write updated data to JSON
        await writeJson(data);

        // Return the product info and carbon emissions for the celebrity
        res.json({
            celebrity: celebrity,
            product_name: productName,
            category: productCategory,
            carbon_emission: emissions,
            celebrity_total_emissions: data.celebrities[celebrity].total_emissions,
            overall_total_emissions: data.total_emissions
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});


// Get total emissions and product details from JSON file
app.get('/total_emissions', async (req, res) => {
    try {
        const data = await readJson();
        res.json(data);
    } catch (error) {
        console.error('Error reading total emissions:', error);
        res.status(500).json({ error: 'An error occurred while retrieving total emissions.' });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

