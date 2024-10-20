import axios from 'axios';
import express from 'express'
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const app = express();
app.use(express.json());

const jsonFile = 'user_inputs.json';

async function readJson() {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { total_emissions: 0 };  // If file not found, initialize with zero emissions
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

            // Extract activityId, unit, and unit_type from the result
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

app.post('/calculate_emission', async (req, res) => {
    const { barcode } = req.body;
    console.log("hi")

    try {
        // 1. Fetch product data from Open Food Facts API
        const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const openFoodFactsResponse = await axios.get(openFoodFactsUrl);

        if (openFoodFactsResponse.data.status === 0) {
            return res.status(404).json({ error: "open food no product found" });
        }

        const product = openFoodFactsResponse.data.product || {};
        const productCategory = product.categories || 'Unknown';
        const productName = product.product_name || 'Unknown';
        // const fdcCat = product.sources_fields.fdc_category;
        let fdcCat = 'Unknown';
        if (product.sources_fields && product.sources_fields['org-database-usda']) {
            fdcCat = product.sources_fields['org-database-usda'].fdc_category || 'Unknown';
        }

        // console.log("product: ", product)
        // console.log("product cat: ", productCategory)
        // console.log("product name: ", productName)
        console.log("product fdc: ", fdcCat);

        // 2. Search for the emission factor based on product category or name
        const searchQuery = fdcCat;
        // productCategory || productName;
        const { activityId, unit, unit_type } = await searchEmissionFactor(searchQuery);
        console.log("unit: ", unit);
        console.log("unit type: ", unit_type);

        console.log("SEARCH SUCCESSFUL");
        console.log("activityid: ", activityId);

        if (!activityId) {
            return res.status(404).json({ error: "climatiq search error" });
        }

        // 3. Estimate the carbon emissions using the activity ID and relevant parameters
        const parameters = {
            [unit_type.toLowerCase()]: 1,  // Example: 1 unit of product (you can adapt this)
            [`${unit_type.toLowerCase()}_unit`]: 'usd'  // Adjust based on product type, e.g., 'kg', 'kWh', etc.
        };
        const emissions = await estimateEmissions(activityId, parameters);

        // 4. Store total emissions in JSON file
        const data = await readJson();
        data.total_emissions += emissions;
        await writeJson(data);

                console.log({
            product_name: productName,
            category: productCategory,
            carbon_emission: emissions,
            total_emissions: data.total_emissions
        });


        // Return the product info and carbon emissions
        res.json({
            product_name: productName,
            category: productCategory,
            carbon_emission: emissions,
            total_emissions: data.total_emissions
        });


    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

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


app.get('/get', async (req, res) => {
    try {
        // Set the barcode value
        const barcode = '038000219634';

        // Send a POST request to the /calculate_emission route

        const response = await fetch('http://localhost:3003/calculate_emission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ barcode })  // Sending the barcode in the request body
        });

        // Parse the response data as JSON
        const data = await response.json();

        // Send the response data in the frontend
        res.json({
            message: 'Server is up and running!',
            emissionsData: data
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    }
});


// async function calculateEmission(barcode) {
//     console.log('barcode: ', barcode);
//     const openFoodFactsUrl = `https://us.openfoodfacts.org/api/v0/product/${barcode}.json`;

//     try {
//         const offResponse = await axios.get(openFoodFactsUrl);
//         const product = offResponse.data.product || {};

//         const productCategory = product.categories || 'Unknown';
//         const productName = product.product_name || 'Unknown';

//         console.log('Product:', product);
//         console.log('Category:', productCategory);
//         console.log('Product Name:', productName);

//         const climatiqUrl = `https://api.climatiq.io`
        
//     } catch {

//     }

// }

// calculateEmission('7022101111');
// calculateEmission('038000219634');

/*

get -> fetch data
post -> posts
/calc/var1/ <- var1 is the barcode


get -> output user_inputs
*/