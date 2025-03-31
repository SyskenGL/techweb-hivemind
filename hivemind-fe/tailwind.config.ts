/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      screens: {
        '3xl': '1664px',
        '4xl': '1792px',
        '5xl': '1920px'
      },
      fontSize: {
        '10xl': '9rem'
      },
      keyframes: {
        'text-slide': {
          '0%, 16%': { transform: 'translateY(0%)' },
          '20%, 36%': { transform: 'translateY(-16.66%)' },
          '40%, 56%': { transform: 'translateY(-33.33%)' },
          '60%, 76%': { transform: 'translateY(-50%)' },
          '80%, 96%': { transform: 'translateY(-66.66%)' },
          '100%': { transform: 'translateY(-83.33%)' }
        }
      },
      animation: {
        'text-slide': 'text-slide 12.5s cubic-bezier(0.8, 0, 0.2, 1) infinite'
      },
      dropShadow: {
        card: '0 0px 10px oklch(var(--bc) / 0.25)'
      }
    },
    fontFamily: {
      heading: ['Poppins', 'Helvetica'],
      body: ['"Open Sans"', 'Arial'],
      digit: ['Poppins', 'Helvetica']
    },
    colors: {
      'primary-shadow': 'oklch(var(--primary-shadow) / <alpha-value>)',
      'base-content-muted': 'oklch(var(--base-content-muted) / <alpha-value>)',
      skeleton: 'oklch(var(--skeleton) / <alpha-value>)',
      upvote: 'oklch(var(--upvote) / <alpha-value>)',
      downvote: 'oklch(var(--downvote) / <alpha-value>)'
    }
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#f43f5e',
          secondary: '#f43f5e',
          'base-content': '#000000',
          neutral: '#2e2b26',
          '--upvote': '85% 0.2023 95',
          '--downvote': '45% 0.16 4',
          '--primary-shadow': '64.5% 0.2154 16.44',
          '--base-content-muted': '70.18% 0.0181 256.847952',
          '--skeleton': '98% 0 0',
          '--rounded-box': '1rem',
          '--rounded-btn': '2rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '.2s',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem'
        },
        dark: {
          ...require('daisyui/src/theming/themes')['black'],
          primary: '#3d00ff',
          secondary: '#ffffff',
          accent: '#15b9ff',
          info: '#15b9ff',
          'base-content': '#ffffff',
          '--upvote': '88% 0.2 95',
          '--downvote': '45% 0.16 4',
          '--primary-shadow': '47% 0.3 273',
          '--base-content-muted': '55% 0 0',
          '--skeleton': '35% 0 0',
          '--rounded-box': '1rem',
          '--rounded-btn': '2rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '.2s',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem'
        }
      }
    ]
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animated'),
    require('tailwind-scrollbar'),
    require('daisyui')
  ]
};
