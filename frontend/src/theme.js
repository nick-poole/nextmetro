import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#ff5e00',
		},
		background: {
			default: '#121212',
			paper: '#1e1e1e',
		},
		text: {
			primary: '#ffffff',
		},
	},
	typography: {
		fontFamily: "'Orbitron', sans-serif",

		h1: {
			fontFamily: "'Oxanium', sans-serif",
			fontWeight: 700,
			fontSize: '3rem',
		},
		h2: {
			fontFamily: "'Oxanium', sans-serif",
			fontWeight: 600,
			fontSize: '2.5rem',
		},
		h3: {
			fontFamily: "'Oxanium', sans-serif",
			fontWeight: 500,
			fontSize: '2rem',
		},
		h4: {
			fontFamily: "'Oxanium', sans-serif",
			fontWeight: 500,
			fontSize: '1.6rem',
		},
		ticker: {
			fontFamily: "'Share Tech Mono', monospace",
			fontSize: '1.2rem',
		},
	},
});
export default theme;
