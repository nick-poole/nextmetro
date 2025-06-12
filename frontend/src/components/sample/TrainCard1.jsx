import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

function TrainCard1({ line, destination, arrival, cars }) {
	return (
		<Card sx={{ mb: 2, bgcolor: '#1e1e1e', color: 'white', position: 'relative' }}>
			<CardContent>
				{/* Line Badge */}
				<Box
					sx={{
						position: 'absolute',
						top: 8,
						left: 8,
						bgcolor: '#333',
						color: 'white',
						px: 1,
						py: 0.25,
						borderRadius: 1,
						fontSize: '0.75rem',
						fontWeight: 'bold',
					}}>
					{line}
				</Box>

				<Typography variant="h6" sx={{ fontWeight: 'bold', ml: 5 }}>
					{destination}
				</Typography>

				<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
					<Typography variant="body2">Cars: {cars}</Typography>
					<Typography variant="body2">Arrival: {arrival}</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}

export default TrainCard1;
