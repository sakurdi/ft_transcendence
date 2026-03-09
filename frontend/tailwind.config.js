/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				g_black: {
					DEFAULT: "#221F21",
					50: "#F1F0F1",
					100: "#E7E5E6",
					200: "#CFCBCD",
					300: "#B5AFB3",
					400: "#9F969C",
					500: "#887F85",
					600: "#70686E",
					700: "#575155",
					800: "#413C40",
					900: "#2D292B",
					950: "#221F21"
				},
				g_glaucous: {
					DEFAULT: "#728BB4",
					50: "#F1F4F8",
					100: "#E0E5F0",
					200: "#C5CFE3",
					300: "#A7B7D5",
					400: "#8BA1C8",
					500: "#728BB4",
					600: "#5A6E8F",
					700: "#41516A",
					800: "#2C374A",
					900: "#171E2A",
					950: "#0E141D"
				},
				g_white: {
					DEFAULT: "#F4F4F9",
					50: "#F4F4F9",
					100: "#E4E4F1",
					200: "#C7C7E1",
					300: "#AAAAD2",
					400: "#8F8FC3",
					500: "#7373B3",
					600: "#5959A0",
					700: "#3F3F83",
					800: "#2B2B5D",
					900: "#181839",
					950: "#0E0E27"
				},
				g_seagreen: {
					DEFAULT: "#03B5AA",
					50: "#C4FFF8",
					100: "#66FFF2",
					200: "#05E7D9",
					300: "#04CEC2",
					400: "#03B5AA",
					500: "#02948B",
					600: "#01756E",
					700: "#015852",
					800: "#003C38",
					900: "#002220",
					950: "#001715"
					},
				g_aqua: {
					DEFAULT: "#a8dcd9",
					50:  "#f1fafa",
					100: "#dcf1f0",
					200: "#a8dcd9",
					300: "#8fd1cd",
					400: "#5ab6b3",
					500: "#3e9c9b",
					600: "#368284",
					700: "#316a6d",
					800: "#2f575b",
					900: "#2b4a4e",
					950: "#183134",
				},

			},
			animation: {
				"gradient-x": "gradient-x 6s ease infinite",
			},
			keyframes: {
				"gradient-x": {
				"0%, 100%": { backgroundPosition: "0% 50%" },
				"50%": { backgroundPosition: "100% 50%" },
				},
			},
			backgroundSize: {
				"200%": "200% 200%",
			},
		},
	},
	plugins: [
	],
};

// https://coolors.co/221f21-728bb4-f4f4f9-03b5aa-a8dcd9
