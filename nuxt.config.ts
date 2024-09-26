import Aura from "@primevue/themes/aura"

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@primevue/nuxt-module", "@nuxt/image"],
  app: {
    head: {
      title: "WarehouseManager",
      link: [
        {
          rel: "icon",
          href: "/favicon.png"
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
        },
      ],
    },
  },
  primevue: {
    autoImport: true,
    options: {
      theme: {

        preset: Aura,
        options: {
          darkModeSelector: ".darkMode",
          cssLayers: {
            name: "primevue",
            order: "tailwind-base, primevue, tailwind-utilities"
          },
        },
      },
    },
  },
})