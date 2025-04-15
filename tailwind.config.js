// tailwind.config.js

const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ألوان مرتبطة بمتغيرات CSS
        'beige-light': 'var(--color-beige-light)',
        'brown-dark': 'var(--color-brown-dark)',
        'olive-green': 'var(--color-olive-green)',
        'cream-gray': 'var(--color-cream-gray)',
        'golden-calm': 'var(--color-golden-calm)',
        'blue-muted': 'var(--color-blue-muted)',

        // --- اللون الأساسي primary ---
        primary: {
          DEFAULT: 'var(--color-olive-green)',
          50: '#e6f0ff',
          100: '#bfd9ff',
          200: '#99c2ff',
          300: '#73aaff',
          400: '#4d93ff',
          500: 'var(--color-olive-green)', // التدرج الأساسي يبقى من الـ CSS variable
          600: '#1a75ff',
          700: '#005ce6',
          800: '#0047b3',
          900: '#003380',
          950: '#001a4d',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),

    // تعريف المتغيرات في :root و .dark
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          '--color-beige-light': '#F8F4EC',
          '--color-brown-dark': '#3B2F2F',
          '--color-olive-green': '#0066bd',
          '--color-cream-gray': '#E8E2D6',
          '--color-golden-calm': '#D4AF37',
          '--color-blue-muted': '#6D91A0',
        },
        '.dark': {
          '--color-beige-light': '#1e1e1e',
          '--color-brown-dark': '#f5f5f5',
          '--color-olive-green': '#79b8f3',
          '--color-cream-gray': '#2a2a2a',
          '--color-golden-calm': '#ffe083',
          '--color-blue-muted': '#88a9b5',
        }
      })
    })
  ]
}
