import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const lineColors = {
	RD: '#d32f2f',
	BL: '#1976d2',
	YL: '#fbc02d',
	OR: '#ff9800',
	GR: '#388e3c',
	SV: '#9c27b0',
};

function TrainCard3({
	line,
	destination,
	arrival,
	cars,
	trainId,
	direction,
	serviceType, // e.g., "NoPassengers", "Train", "Normal"
}) {
	const isStatus = ['ARR', 'BRD', 'DLY'].includes(arrival);
	const lineColor = lineColors[line] || '#555';

	return (
		<Card
			sx={{
				mb: 2,
				display: 'flex',
				flexDirection: 'row',
				bgcolor: '#121212',
				color: 'white',
				position: 'relative',
				overflow: 'hidden',
			}}>
			{/* Left Side Content */}
			<CardContent sx={{ flex: 1 }}>
				{/* Top Row: Line + Destination (left) and Arrival/Chip (right) */}
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: 1,
					}}>
					{/* Left: Line badge + Destination */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box
							sx={{
								bgcolor: lineColor,
								color: '#000',
								fontWeight: 'bold',
								px: 1.5,
								py: 0.25,
								borderRadius: 1,
								fontSize: '0.75rem',
							}}>
							{line}
						</Box>
						<Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'Oxanium' }}>
							{destination}
						</Typography>
					</Box>

					{/* Right: Arrival or Status */}
					{isStatus ? (
						<Chip
							label={arrival}
							color="success"
							size="small"
							sx={{
								fontWeight: 'bold',
								fontFamily: "'Share Tech Mono', monospace",
							}}
						/>
					) : (
						<Typography
							variant="body2"
							sx={{
								fontFamily: "'Share Tech Mono', monospace",
								fontWeight: 'bold',
							}}>
							{arrival}
						</Typography>
					)}
				</Box>

				{/* Direction and Cars */}
				<Typography variant="body2" sx={{ mb: 0.5 }}>
					Direction: {direction}
				</Typography>
				<Typography variant="body2">Cars: {cars}</Typography>

				{/* Optional serviceType note */}
				{serviceType && serviceType !== 'Normal' && (
					<Typography
						variant="caption"
						sx={{
							mt: 1,
							fontStyle: 'italic',
							color: 'orange',
						}}>
						{serviceType === 'NoPassengers'
							? 'Not in service (No Passengers)'
							: serviceType === 'Train'
							? 'Train at Platform'
							: serviceType}
					</Typography>
				)}
			</CardContent>

			{/* Line Color Strip – Right Side */}
			<Box
				sx={{
					width: '6px',
					backgroundColor: lineColor,
				}}
			/>

			{/* Train ID – Bottom Right Overlay */}
			{trainId && (
				<Typography
					variant="caption"
					sx={{
						position: 'absolute',
						bottom: 8,
						right: 20,
						fontStyle: 'italic',
						color: '#aaa',
					}}>
					Train ID: {trainId}
				</Typography>
			)}
		</Card>
	);
}

export default TrainCard3;
