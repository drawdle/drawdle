import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				beige: {
					100: "#faf7f2",
					200: "#f5efe5",
					300: "#efe8d8",
					400: "#eae0cb",
					500: "#e5d8be",
					600: "#b7ad98",
					700: "#898272",
					800: "#5c564c",
					900: "#2e2b26",
				},
			},
		},
	},
	plugins: [],
};
export default config;
