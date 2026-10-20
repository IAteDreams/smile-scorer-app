/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  // Tailwind v4 has no JS config; the plugin reads theme classes from here.
  tailwindStylesheet: "./app/globals.css",
  tailwindFunctions: ["cva", "cn"],
};

export default config;
