module.exports = {
  mode: "jit",
  purge: ["./src/**/*.tsx"],
  darkMode: false,
  theme: {
    container: {
      padding: "1rem",
    },
    screens: {
      md: "768px",
    },
    fontSize: {
      xxs: ["0.675rem"],
      xs: ["0.8125rem"],
      sm: ["0.9375rem"],
      base: ["1.0625rem", "1.85rem"],
      "3xl": ["1.65rem", "2.5rem"],
      "4xl": ["2rem", "2.5rem"],
    },
    extend: {
      colors: {
        gray: {
          100: "#d8dee9",
          700: "#2e3440",
          800: "#2c313d",
          900: "#21252e",
        },
      },
    },
  },
};
