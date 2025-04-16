/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./index.html",
	  "./srcs/**/*.{ts,tsx,js,jsx}",
	  "./pages/**/*.{ts,tsx,js,jsx}"
	],
	theme: {
	  extend: {
		fontFamily: {
			'jaro': ['Jaro', 'Jost', 'sans-serif'],
			'inria': ['Inria Sans', 'sans-serif'],
		  },
	  }
	},
	plugins: []
  };