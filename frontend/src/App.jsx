import React from 'react';
import { CssBaseline, Container, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavBar from './components/NavBar';
import HeroBanner from './components/HeroBanner';
import StationSelect from './components/StationSelect';
import Footer from './components/Footer';
import { mockTrains } from './data/sample/mockTrains';
import TrainCard1 from './components/sample/TrainCard1';
import TrainCard2 from './components/sample/TrainCard2';
import TrainCard3 from './components/sample/TrainCard3';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<NavBar />
			<HeroBanner />
			<Container maxWidth="md">
				<StationSelect onSelect={(code) => console.log('Selected:', code)} />

				{mockTrains.map((t, i) => (
					<TrainCard3 key={`3-${i}`} {...t} />
				))}
				{/*
				{mockTrains.map((train, index) => (
					<TrainCard1 key={index} {...train} />
					<TrainCard2 key={index} {...train} />
					<TrainCard3 key={index} {...train} />
				))} */}
			</Container>
			<Footer />
		</ThemeProvider>
	);
}

export default App;
