/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				gshadowgrey:"#221F21",
				gglaucous:	"#728BB4",
				glinen:		"#F7ECE1",
				gseagreen:	"#03B5AA",
				gaqua:		"#A8DCD9",
			},
		},
	},
	plugins: [
	],
};
