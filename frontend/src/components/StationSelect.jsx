import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { stations } from '../data/stations';

function StationSelect({ onSelect }) {
	const [selected, setSelected] = useState('B05'); // Brookland-CUA

	const handleChange = (event) => {
		const code = event.target.value;
		setSelected(code);
		onSelect && onSelect(code);
	};

	return (
		<FormControl fullWidth sx={{ mt: -1, mb: 3 }}>
			<InputLabel id="station-label">Select Station</InputLabel>
			<Select labelId="station-label" value={selected} label="Select Station" onChange={handleChange}>
				<MenuItem value="">
					<em>None</em>
				</MenuItem>
				{Object.entries(stations).map(([code, name]) => (
					<MenuItem key={code} value={code}>
						{name}
					</MenuItem>
				))}
			</Select>
			<FormHelperText>Choose a station to view upcoming trains.</FormHelperText>
		</FormControl>
	);
}

export default StationSelect;
