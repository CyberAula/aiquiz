/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    
    // colors: {
    //   'light-emerald': 
    // },
    
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        customColor: '#444444', 
        core: {
          50:"#fcdfd1",
          100: "#f7c2a8",
          200: "#edad8e",
          400: "#c64f13"
        },
        ibdn: {
          100: "#b3d5d6",
          400: "#c64f13"
        },
        tecw: {
          100: "#bbceb5",
          400: "#c64f13"
        },
        bbdd: {
          100: "#e8cfa7",
          400: "#c64f13"
        },
        iweb: {
          100: "#bfbee5",
          400: "#c64f13"
        },
        cdps: {
          100: "#d5bee5",
          400: "#c64f13"
        },
        prg: {
          100: "#cacad1",
          400: "#c64f13"
        },
        text: {
          default: "#444444"
        }
      },
      
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}