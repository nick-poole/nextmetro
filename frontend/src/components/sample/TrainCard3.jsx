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
	serviceType, // new: e.g., "NoPassengers", "Train", "Normal"
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
				{/* Top: Destination and Line */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
					<Typography variant="h6" fontWeight="bold">
						{destination}
					</Typography>
				</Box>

				{/* Arrival or Status Chip */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
					{isStatus ? (
						<Chip label={arrival} color="success" size="small" sx={{ fontWeight: 'bold' }} />
					) : (
						<Typography variant="body2">Arrival: {arrival}</Typography>
					)}
				</Box>

				{/* Direction and Cars */}
				<Typography variant="body2" sx={{ mb: 0.5 }}>
					Direction: {direction}
				</Typography>
				<Typography variant="body2">Cars: {cars}</Typography>

				{/* Optional serviceType note */}
				{serviceType && serviceType !== 'Normal' && (
					<Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', color: 'orange' }}>
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
						right: 12,
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
