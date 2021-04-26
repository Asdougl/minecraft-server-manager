module.exports = {
  purge: [
    "./src/**/*.tsx"
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
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
