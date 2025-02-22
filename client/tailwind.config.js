/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      flexGrow: {
        3: 3,
      },
      fontFamily: {
        title: ["Space Grotesk", "sans-serif"], // Title font
        content: ["Montserrat", "sans-serif"], // Content font
        button: ["Open Sans", "sans-serif"], // Button font
      },
      colors: {
        "primary-color": "#EACFF9",
        "secondary-color": "#FFECDA",
        "dark-color": "#1D1D24",
        "light-color": "#F6F3F1",
        "accent-color": "#E5ECF9",
      },
      backgroundImage: {
        "main-gradient": "linear-gradient(120deg, #EACFF9, #FFECDA)",
        "black-gradient": "linear-gradient(120deg, #000000, #2a2a2a)",
      },
    },
  },
  plugins: [],
};
