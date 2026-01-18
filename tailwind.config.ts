import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        'dark-950': '#0d1912',
        'dark-900': '#0f1c14',
        'dark-850': '#111f16',
        'dark-800': '#132218',
        'dark-750': '#15251a',
        'dark-700': '#17281c',
        'dark-650': '#192b1e',
        'dark-600': '#1b2e20',
        'dark-550': '#1d3122',
        'dark-500': '#1f3424',
        'dark-450': '#213726',
        'dark-400': '#233a28',
        'dark-350': '#253d2a',
        'dark-300': '#27402c',
        'dark-250': '#29432e',
        'dark-200': '#2b4630',
        'dark-150': '#2d4932',
        'dark-100': '#2f4c34',
      }
    },
    screens: {
      '2xl': { 'max': '1536px' },
      // => @media (max-width: 1535px) { ... }

      'xl': { 'max': '1280px' },
      // => @media (max-width: 1279px) { ... }

      'lg': { 'max': '1024px' },
      // => @media (max-width: 1023px) { ... }

      'md': { 'max': '768px' },
      // => @media (max-width: 767px) { ... }

      'sm': { 'max': '640px' },
      // => @media (max-width: 639px) { ... }
    }
  },
  plugins: [],
};
export default config;
