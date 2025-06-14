import React, { useEffect, useState } from 'react';
import TrainCard from './TrainCard';
import { Typography } from '@mui/material';
import { API_BASE_URL } from '../config';

function StationFeed({ stationCode }) {
	const [trains, setTrains] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!stationCode) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				const res = await fetch(`${API_BASE_URL}/api/predictions/${stationCode}`);

				if (!res.ok) throw new Error('API error');
				const data = await res.json();
				setTrains(data);
				setError(null);
			} catch (err) {
				setError(err.message || 'Fetch failed');
				setTrains([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData(); // Initial fetch

		const interval = setInterval(fetchData, 30000); // Auto-refresh every 30 sec
		return () => clearInterval(interval); // Cleanup on unmount
	}, [stationCode]);

	if (loading) return <Typography>Loading trains...</Typography>;
	if (error) return <Typography color="error">Error: {error}</Typography>;
	if (trains.length === 0) return <Typography>No trains at this time.</Typography>;

	return (
		<>
			{trains.map((train, i) => (
				<TrainCard key={i} {...train} />
			))}
		</>
	);
}

export default StationFeed;
