/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        cerulean: '#3f99ec',
        navy: '#286aa8',
        greyout: '#f5f5f5',
      }
    },
    fontSize: {
      xxxs: '8px',
      xxs: '10px',
      xs: '12px',
      s: '14px',
      m: '16px',
      l: '18px',
      xl: '24px',
      xxl: '32px',
    },
    spacing: {
      auto: 'auto',
      0: '0',
      xs: '2px',
      s: '4px',
      n: '8px',
      m: '12px',
      l: '16px',
      xl: '20px',
      xxl: '24px',
      xxxl: '28px',
    },
    borderRadius: {
      '0': 0,
      0: '0',
      xs: '2px',
      s: '4px',
      n: '8px',
      m: '12px',
      l: '16px',
      xl: '20px',
      xxl: '24px',
      xxxl: '28px',
      circle: '50%',
    },
    boxShadow: {
      'positive-elevation': '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
      'positive-elevation-2': '0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%)',
    }
  },
  plugins: [],
  prefix: 'tw-'
}
