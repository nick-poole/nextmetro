const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Enable CORS for all routes
app.use(cors());
app.set('trust proxy', true);

const WMATA_API_KEY = process.env.WMATA_API_KEY;

// Base WMATA API -Real-Time Rail Predictions
const BASE_URL = 'https://api.wmata.com/StationPrediction.svc/json/GetPrediction';

app.get('/api/predictions/:stationCode', async (req, res) => {
	const { stationCode } = req.params;

	try {
		const response = await fetch(`${BASE_URL}/${stationCode}`, {
			headers: { api_key: WMATA_API_KEY },
		});

		if (!response.ok) {
			return res.status(response.status).json({ error: 'Failed to fetch WMATA data' });
		}

		const data = await response.json();

		// Transform API data into TrainCard-compatible format
		const formattedTrains = data.Trains.map((train) => ({
			line: train.Line,
			destination: train.DestinationName,
			arrival: train.Min,
			cars: train.Car,
		}));

		res.json(formattedTrains);
	} catch (error) {
		console.error('API error:', error);
		res.status(500).json({ error: 'Server error' });
	}
});

app.listen(PORT, () => {
	console.log(`Express server listening on port ${PORT}`);
});
