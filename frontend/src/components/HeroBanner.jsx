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
	const [fade, setFade] = useState(true);

	useEffect(() => {
		const interval = setInterval(() => {
			setFade(false);
			setTimeout(() => {
				setIndex((prevIndex) => (prevIndex + 1) % images.length);
				setFade(true);
			}, 600);
		}, 10000);

		return () => clearInterval(interval);
	}, []);

	return (
		<Box
			sx={{
				position: 'relative',
				height: { xs: 150, sm: 180 },
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
				opacity: fade ? 1 : 0,
				transition: 'opacity 0.6s ease-in-out',
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
					mb: 1,
					fontSize: { xs: '1.75rem', sm: '2rem' },
				}}>
				NextMetro
			</Typography>

			<Typography
				variant="h5"
				component="p"
				sx={{
					position: 'relative',
					zIndex: 2,
					fontFamily: "'Orbitron', sans-serif",
					fontWeight: 'medium',
					px: 4,
					mt: 0.5,
					fontSize: { xs: '0.85rem', sm: '1.1rem' },
				}}>
				Real-time train arrivals for the D.C. Metro system.
			</Typography>
		</Box>
	);
}

export default HeroBanner;
