import React, { useState, useMemo } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import { stations } from '../data/stations';

// Map station code prefix to primary metro line colors
const prefixLineColors = {
	A: ['#d32f2f'],            // Red
	B: ['#d32f2f'],            // Red
	C: ['#1976d2', '#ff9800', '#9ca7a4'], // Blue, Orange, Silver
	D: ['#1976d2', '#ff9800', '#9ca7a4'], // Blue, Orange, Silver
	E: ['#388e3c', '#fbc02d'], // Green, Yellow
	F: ['#388e3c', '#fbc02d'], // Green, Yellow
	G: ['#1976d2', '#9ca7a4'], // Blue, Silver
	J: ['#1976d2', '#fbc02d'], // Blue, Yellow
	K: ['#ff9800', '#9ca7a4'], // Orange, Silver
	N: ['#9ca7a4'],            // Silver
	S: ['#1976d2', '#fbc02d'], // Blue, Yellow
};

function StationSelect({ onSelect }) {
	const stationOptions = useMemo(
		() =>
			Object.entries(stations).map(([code, name]) => ({
				code,
				name,
				colors: prefixLineColors[code.charAt(0)] || ['#555'],
			})),
		[]
	);

	const defaultStation = stationOptions.find((s) => s.code === 'B05') || stationOptions[0];
	const [value, setValue] = useState(defaultStation);

	return (
		<Autocomplete
			value={value}
			onChange={(_, newValue) => {
				setValue(newValue);
				if (newValue) {
					onSelect && onSelect(newValue.code);
				}
			}}
			options={stationOptions}
			getOptionLabel={(option) => option.name}
			isOptionEqualToValue={(option, val) => option.code === val.code}
			renderOption={(props, option) => {
				const { key, ...rest } = props;
				return (
					<Box
						key={key}
						component="li"
						{...rest}
						sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
					>
						<Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
							{option.colors.map((color) => (
								<Box
									key={color}
									sx={{
										width: 10,
										height: 10,
										borderRadius: '50%',
										bgcolor: color,
									}}
								/>
							))}
						</Box>
						{option.name}
					</Box>
				);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					label="Search stations"
					placeholder="Type to search..."
					helperText="Choose a station to view upcoming trains."
				/>
			)}
			fullWidth
			disableClearable
			sx={{ mt: -1, mb: 3 }}
		/>
	);
}

export default StationSelect;
