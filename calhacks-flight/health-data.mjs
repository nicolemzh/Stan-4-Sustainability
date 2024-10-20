import express from 'express';
import fs from 'fs/promises';
import cors from 'cors';

const app = express();
const jsonFile = 'user_inputs.json';

app.use(express.json());
app.use(cors());

async function readJson() {
    try {
        const data = await fs.readFile(jsonFile, 'utf8');
        const parsedData = JSON.parse(data);

        // Ensure total_emissions and celebrities are initialized
        if (!parsedData.total_emissions) {
            parsedData.total_emissions = 0;
        }
        if (!parsedData.celebrities) {
            parsedData.celebrities = {};
        }

        return parsedData;
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file not found, initialize with zero emissions and an empty celebrity list
            return { total_emissions: 0, celebrities: {} };
        }
        throw error;
    }
}

async function writeJson(data) {
    await fs.writeFile(jsonFile, JSON.stringify(data, null, 2), 'utf8');
}

// Function to calculate CO2 saved by walking (based on steps)
const calculateCO2ForWalking = (steps) => {
    const metersPerStep = 0.762;
    const distanceInKm = (steps * metersPerStep) / 1000; // Convert steps to kilometers
    const co2PerKm = 0.404; // CO2 saved per km for walking
    return { distance: distanceInKm, co2Saved: distanceInKm * co2PerKm };
};

// Function to calculate CO2 saved by other transport modes (public transport, bike)
const calculateCO2ForOther = (distance, mode) => {
    let co2Saved = 0;
    if (mode === 'public transport') {
        co2Saved = distance * 0.056; // CO2 saved per km for public transport
    } else if (mode === 'bike') {
        co2Saved = distance * 0.21; // CO2 saved per km for biking
    }
    return co2Saved;
};

// POST endpoint to handle transportation data and update JSON
app.post('/save_transportation/:mode/:distanceOrSteps/:celebrity', async (req, res) => {
    const { mode, distanceOrSteps, celebrity } = req.params;

    // Parse distance or steps
    const parsedDistanceOrSteps = parseFloat(distanceOrSteps);
    if (isNaN(parsedDistanceOrSteps)) {
        return res.status(400).json({ error: 'Invalid distance or steps value' });
    }

    try {
        let data = await readJson();
        let distance, co2Saved;

        // Calculate CO2 saved based on the transportation mode
        if (mode === 'steps') {
            const result = calculateCO2ForWalking(parsedDistanceOrSteps);
            distance = result.distance;
            co2Saved = result.co2Saved;
        } else {
            distance = parsedDistanceOrSteps;
            co2Saved = calculateCO2ForOther(distance, mode);
        }

        // Ensure the celebrity exists in the data
        if (!data.celebrities[celebrity]) {
            data.celebrities[celebrity] = {
                total_emissions: 0,
                transportation: [], // Initialize transportation array if it doesn't exist
            };
        }

        // If the transportation array doesn't exist, initialize it
        if (!Array.isArray(data.celebrities[celebrity].transportation)) {
            data.celebrities[celebrity].transportation = [];
        }

        // Update celebrity's total emissions and transportation list
        data.celebrities[celebrity].total_emissions += co2Saved;
        data.celebrities[celebrity].transportation.push({
            mode_of_transportation: mode,
            distance_traveled: distance,
            carbon_emission_saved: co2Saved
        });

        // Update total emissions for all celebrities
        data.total_emissions += co2Saved;

        // Write updated data back to the JSON file
        await writeJson(data);

        // Return success response with calculated data
        res.json({
            co2Saved,
            totalEmissionsForCelebrity: data.celebrities[celebrity].total_emissions,
            totalEmissions: data.total_emissions,
        });

    } catch (error) {
        console.error('Error processing transportation data:', error);
        res.status(500).json({ error: 'An error occurred while saving the data.' });
    }
});

// Get total emissions and celebrity details from JSON
app.get('/total_emissions', async (req, res) => {
    try {
        const data = await readJson();
        res.json(data);
    } catch (error) {
        console.error('Error reading total emissions:', error);
        res.status(500).json({ error: 'An error occurred while retrieving total emissions.' });
    }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
