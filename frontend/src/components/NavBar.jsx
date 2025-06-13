import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

function NavBar() {
	return (
		<AppBar position="sticky" elevation={3}>
			<Toolbar sx={{ justifyContent: 'space-between' }}>
				{/* Clickable Text Logo */}
				<Typography
					variant="h6"
					component="a"
					href="/"
					sx={{
						fontWeight: 'bold',
						textDecoration: 'none',
						color: 'inherit',
					}}>
					NextMetro
				</Typography>

				{/* Right-Aligned Nav Links */}
				<Box sx={{ display: 'flex', gap: 2 }}>
					<Button color="inherit">About</Button>
					<Button color="inherit" href="https://988lifeline.org/" target="_blank" rel="noopener">
						988
					</Button>
					<Button
						color="inherit"
						href="https://www.wmata.com/schedules/maps/wmata-system-map.cfm"
						target="_blank"
						rel="noopener">
						System Map
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default NavBar;
