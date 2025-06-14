import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const lineColors = {
	RD: '#d32f2f',
	BL: '#1976d2',
	YL: '#fbc02d',
	OR: '#ff9800',
	GR: '#388e3c',
	SV: '#9ca7a4',
};
const flashStyle = {
	'@keyframes flash': {
		'0%': { opacity: 1 },
		'50%': { opacity: 0.3 },
		'100%': { opacity: 1 },
	},
	animation: 'flash 2s infinite ease-in-out',
};

function TrainCard({ line, destination, arrival, cars }) {
	const isStatus = ['ARR', 'BRD', 'DLY'].includes(arrival?.toUpperCase());
	const lineColor = lineColors[line] || '#555';

	return (
		<Card
			sx={{
				my: 2,
				mx: 2,
				display: 'flex',
				flexDirection: 'row',
				bgcolor: '#121212',
				color: 'white',
				position: 'relative',
				overflow: 'hidden',
				width: 'auto',
				borderRadius: 2,
				boxShadow: 4,
			}}>
			{/* Left Line Strip */}
			<Box sx={{ width: '6px', backgroundColor: lineColor }} />

			{/* Main Content */}
			<CardContent sx={{ flex: 1 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: 1,
					}}>
					{/* Line Badge + Destination */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box
							sx={{
								bgcolor: lineColor,
								color: '#000',
								fontWeight: 'bold',
								px: 1.5,
								py: 0.25,
								borderRadius: 1,
								fontSize: '1rem',
								minWidth: '2.5rem',
								textAlign: 'center',
							}}>
							{line}
						</Box>
						<Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'Oxanium', fontSize: 20 }}>
							{destination}
						</Typography>
					</Box>

					{/* Arrival Time or Status */}
					{isStatus ? (
						<Chip
							label={
								<Typography
									component="span"
									sx={{
										fontFamily: "'Share Tech Mono', monospace",
										fontWeight: 'bold',
										fontSize: '1rem',
										color: '#f9763d',
										...(arrival === 'ARR' || arrival === 'BRD' ? flashStyle : {}),
									}}>
									{arrival.toUpperCase()}
								</Typography>
							}
							size="small"
							sx={{
								bgcolor: '#000',
								borderRadius: 1,
							}}
						/>
					) : (
						<Typography
							variant="body2"
							sx={{
								fontFamily: "'Share Tech Mono', monospace",
								fontWeight: 'bold',
								fontSize: 20,
							}}>
							{arrival} min{arrival === '1' ? '' : 's'}
						</Typography>
					)}
				</Box>

				{/* Car Count */}
				<Typography variant="body2" fontFamily="'Oxanium'">
					Cars: {cars}
				</Typography>
			</CardContent>

			{/* Right Line Strip */}
			<Box sx={{ width: '6px', backgroundColor: lineColor }} />
		</Card>
	);
}

export default TrainCard;
