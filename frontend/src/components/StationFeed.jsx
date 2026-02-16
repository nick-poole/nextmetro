import React, { useEffect, useState, useCallback } from 'react';
import TrainCard from './TrainCard';
import { Typography, Box, Card, CardContent, Skeleton, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrainIcon from '@mui/icons-material/Train';
import { API_BASE_URL } from '../config';

function TrainCardSkeleton() {
	return (
		<Card
			sx={{
				my: 2,
				mx: 2,
				display: 'flex',
				flexDirection: 'row',
				bgcolor: '#121212',
				overflow: 'hidden',
				borderRadius: 2,
				boxShadow: 4,
			}}>
			<Box sx={{ width: '6px', bgcolor: '#333' }} />
			<CardContent sx={{ flex: 1 }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Skeleton variant="rounded" width={40} height={28} sx={{ bgcolor: '#2a2a2a' }} />
						<Skeleton variant="text" width={140} height={28} sx={{ bgcolor: '#2a2a2a' }} />
					</Box>
					<Skeleton variant="text" width={50} height={28} sx={{ bgcolor: '#2a2a2a' }} />
				</Box>
				<Skeleton variant="text" width={60} height={20} sx={{ bgcolor: '#2a2a2a' }} />
			</CardContent>
			<Box sx={{ width: '6px', bgcolor: '#333' }} />
		</Card>
	);
}

function StationFeed({ stationCode }) {
	const [trains, setTrains] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	const fetchData = useCallback(async () => {
		if (!stationCode) return;
		try {
			setLoading(true);
			const res = await fetch(`${API_BASE_URL}/api/predictions/${stationCode}`);

			if (!res.ok) throw new Error('API error');
			const data = await res.json();
			setTrains(data);
			setError(null);
			setLastUpdated(new Date());
		} catch (err) {
			setError(err.message || 'Fetch failed');
			setTrains([]);
		} finally {
			setLoading(false);
		}
	}, [stationCode]);

	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 30000);
		return () => clearInterval(interval);
	}, [fetchData]);

	const formatTime = (date) => {
		if (!date) return '';
		return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
	};

	if (loading && trains.length === 0) {
		return (
			<>
				<TrainCardSkeleton />
				<TrainCardSkeleton />
				<TrainCardSkeleton />
			</>
		);
	}

	if (error) return <Typography color="error">Error: {error}</Typography>;

	if (trains.length === 0) {
		return (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					py: 6,
					color: 'text.secondary',
				}}>
				<TrainIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
				<Typography variant="h6" sx={{ fontFamily: "'Oxanium', sans-serif", mb: 1 }}>
					No trains scheduled
				</Typography>
				<Typography variant="body2" sx={{ opacity: 0.6 }}>
					There are no trains arriving at this station right now.
				</Typography>
			</Box>
		);
	}

	return (
		<>
			{trains.map((train, i) => (
				<TrainCard key={i} {...train} />
			))}
			{lastUpdated && (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						mt: 1,
						mb: 2,
						gap: 0.5,
					}}>
					<Typography
						variant="caption"
						sx={{
							color: 'text.secondary',
							fontFamily: "'Share Tech Mono', monospace",
							fontSize: '0.75rem',
						}}>
						Updated {formatTime(lastUpdated)}
					</Typography>
					<IconButton
						size="small"
						onClick={fetchData}
						sx={{ color: 'text.secondary', p: 0.5 }}
						aria-label="Refresh train data"
					>
						<RefreshIcon sx={{ fontSize: 16 }} />
					</IconButton>
				</Box>
			)}
		</>
	);
}

export default StationFeed;
