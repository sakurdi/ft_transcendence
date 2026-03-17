/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				// Professional Slate-based Palette
				brand: {
					50: "#f0f9f9",
					100: "#d9f2f2",
					200: "#b5e5e5",
					300: "#89d3d2",
					400: "#57b8b6",
					500: "#3d9c9b", // Primary Brand Color (Muted Teal)
					600: "#2d7d7d",
					700: "#276565",
					800: "#235152",
					900: "#214545",
					950: "#0e2829",
				},
				surface: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
				},
				// Legacy compatibility (re-mapping to new palette)
				g_seagreen: {
					DEFAULT: "#3d9c9b",
					400: "#57b8b6",
					600: "#2d7d7d",
				},
				g_aqua: {
					DEFAULT: "#b5e5e5",
					400: "#89d3d2",
					500: "#57b8b6",
				},
				g_glaucous: {
					DEFAULT: "#64748b",
					900: "#1e293b",
				}
			},
			fontFamily: {
				sans: [
					'Inter', 
					'ui-sans-serif', 
					'system-ui', 
					'-apple-system', 
					'BlinkMacSystemFont', 
					'Segoe UI', 
					'Roboto', 
					'Helvetica Neue', 
					'Arial', 
					'sans-serif'
				],
			},
			boxShadow: {
				'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
			}
		},
	},
	plugins: [],
};
