import React from 'react';
import { Box, Chip, Avatar } from '@mui/material';

const lineColors = {
	RD: 'error',
	BL: 'primary',
	YL: 'warning',
	OR: 'secondary',
	GR: 'success',
	SV: 'info',
};

function TrainCard2({ line, destination, arrival, cars }) {
	return (
		<Box sx={{ my: 2 }}>
			<Chip
				avatar={<Avatar>{line}</Avatar>}
				label={`${destination} • ${arrival} • ${cars} cars`}
				color={lineColors[line] || 'default'}
				variant="outlined"
				sx={{ fontWeight: 'bold', width: '100%', px: 2 }}
			/>
		</Box>
	);
}

export default TrainCard2;
