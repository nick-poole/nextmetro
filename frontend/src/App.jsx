import React from 'react';
import { CssBaseline, Container, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NavBar from './components/NavBar';
import HeroBanner from './components/HeroBanner';
import StationSelect from './components/StationSelect';
import Footer from './components/Footer';

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
			</Container>
			<Footer />
		</ThemeProvider>
	);
}

export default App;
