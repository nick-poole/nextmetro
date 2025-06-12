import React from 'react';
import { CssBaseline, Container, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Container>
				<Typography variant="h3" gutterBottom>
					NextMetro
				</Typography>
				<Typography variant="body1">Real-time DC Metro Tracker (v2)</Typography>
			</Container>
		</ThemeProvider>
	);
}

export default App;
