/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f4fd',
          100: '#d1e9fb',
          200: '#a3d2f7',
          300: '#75bcf3',
          400: '#47a5ef',
          500: '#0A3D62', // Main primary color
          600: '#1D2D50',
          700: '#2C3E50',
          800: '#1a2332',
          900: '#0d1119',
        },
        accent: {
          50: '#e6f7f1',
          100: '#ccefe3',
          200: '#99dfc7',
          300: '#66cfab',
          400: '#33bf8f',
          500: '#2ECC71', // Success green
          600: '#1ABC9C',
          700: '#00B894',
          800: '#008a6e',
          900: '#005c49',
        },
        neutral: {
          50: '#F7F7F7',
          100: '#ECF0F1',
          200: '#d5dbdd',
          300: '#bec6c9',
          400: '#a7b1b5',
          500: '#909ca1',
          600: '#737d81',
          700: '#565e61',
          800: '#393f41',
          900: '#1c2021',
        },
        text: {
          primary: '#34495E',
          secondary: '#2C3E50',
        },
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
