module.exports = {
  purge: [
    "./src/**/*.tsx"
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        'grow-width': 'grow-width 2.5s linear',
      },
      keyframes: {
        'grow-width': {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['disabled','even'],
      textColor: ['disabled'],
      cursor: ['disabled'],
      borderRadius: ['first','last','focus'],
      visibility: ['group-focus'],
      borderWidth: ['last']
    },
  },
  plugins: [],
}
