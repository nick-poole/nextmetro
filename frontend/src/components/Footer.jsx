import React from 'react';
import { Box, Typography, Link, Stack } from '@mui/material';

function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				py: 3,
				mt: 8,
				borderTop: '1px solid',
				borderColor: 'divider',
				textAlign: 'center',
			}}>
			<Typography variant="body2" color="text.secondary" gutterBottom>
				© 2025 NextMetro ·{' '}
				<Link href="https://nickpoole.dev" target="_blank" rel="noopener" underline="hover" color="inherit">
					Webmaster
				</Link>{' '}
				·{' '}
				<Link
					href="https://www.wmata.com/schedules/maps/wmata-system-map.cfm"
					target="_blank"
					rel="noopener"
					underline="hover"
					color="inherit">
					System Map
				</Link>{' '}
				·{' '}
				<Link href="https://988lifeline.org/" underline="hover" color="inherit">
					988 Resources
				</Link>{' '}
			</Typography>
		</Box>
	);
}

export default Footer;
