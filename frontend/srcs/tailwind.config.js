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
			'arcade': ['"Press Start 2P"', 'monospace'],
		  },
		colors: {
			player1: '#6868ff',
    		player2: '#ff6868',
		}
	  }
	},
	plugins: []
  };