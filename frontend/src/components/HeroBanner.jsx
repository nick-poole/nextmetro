import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const images = [
	'/images/chris-grafton.jpg',
	'/images/yuvraj-singh.jpg',
	'/images/tatiana-rodriguez.jpg',
	'/images/sara-cottle.jpg',
	'/images/rosie-kerr.jpg',
	'/images/julian-lozano.jpg',
	'/images/matthew-bornhorst.jpg',
	'/images/andrew-wagner.jpg',
	'/images/sam-jotham-sutharson.jpg',
	'/images/maria-oswalt.jpg',
	'/images/maria-oswalt-2.jpg',
	'/images/island-cinematics.jpg',
	'/images/island-cinematics-2.jpg',
	'/images/eleven-photographs.jpg',
	'/images/eleven-photographs-2.jpg',
];

function HeroBanner() {
	const [index, setIndex] = useState(() => Math.floor(Math.random() * images.length));

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, 10000); // every 10 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<Box
			sx={{
				position: 'relative',
				height: 240,
				width: '100%',
				backgroundImage: `url(${images[index]})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				marginBottom: 4,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				'&::after': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'rgba(0, 0, 0, 0.4)',
					zIndex: 1,
				},
			}}>
			<Typography
				variant="h3"
				component="h1"
				sx={{
					position: 'relative',
					zIndex: 2,
					fontFamily: "'Oxanium', sans-serif",
					fontWeight: 'bold',
					px: 2,
					mb: 2,
				}}>
				NextMetro
			</Typography>

			<Typography
				variant="h5"
				component="p"
				sx={{
					position: 'relative',
					zIndex: 2,
					fontSize: 20,
					fontFamily: "'Orbitron', sans-serif",
					fontWeight: 'medium',
					px: 4,
					mt: 1,
				}}>
				Get real-time train information for the D.C. Metro system.
			</Typography>
		</Box>
	);
}

export default HeroBanner;
