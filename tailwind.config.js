import { iconsPlugin, getIconCollections } from "@egoist/tailwindcss-icons"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
    },
  },
  plugins: [
    require("tailwindcss-primeui"),
    iconsPlugin({
      collections: getIconCollections(["mynaui"]),
    }),
  ],
}
