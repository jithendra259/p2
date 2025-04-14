/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-green-100',
    'bg-yellow-100',
    'bg-orange-100',
    'bg-red-100',
    'bg-purple-100',
    'bg-maroon-100',
    'text-green-700',
    'text-yellow-700',
    'text-orange-700',
    'text-red-700',
    'text-purple-700',
    'text-maroon-700',
    'text-green-600',
    'text-yellow-600',
    'text-orange-600',
    'text-red-600',
    'text-purple-600',
    'text-maroon-600',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
