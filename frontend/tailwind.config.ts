import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: colors.indigo,
        'risk-high': colors.red,
        'risk-medium': colors.amber,
        'risk-low': colors.emerald,
      },
    },
  },
  plugins: [],
};

export default config;
