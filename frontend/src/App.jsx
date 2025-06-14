import React, { useState } from 'react'; // 🆕
import { CssBaseline, Container } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavBar from './components/NavBar';
import HeroBanner from './components/HeroBanner';
import StationSelect from './components/StationSelect';
import StationFeed from './components/StationFeed';
import Footer from './components/Footer';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

function App() {
	const [selectedStation, setSelectedStation] = useState('B05'); // Brookland-CUA

	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<NavBar />
			<HeroBanner />
			<Container maxWidth="md">
				<StationSelect onSelect={(code) => setSelectedStation(code)} />

				{/* Dynamically update StationFeed */}
				<StationFeed stationCode={selectedStation} />
			</Container>
			<Footer />
		</ThemeProvider>
	);
}

export default App;
