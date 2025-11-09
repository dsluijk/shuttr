export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@unlazy/nuxt",
    "@vueuse/nuxt",
    "motion-v/nuxt",
    "nuxt-auth-utils",
    "nuxt-authorization",
  ],

  devtools: {
    enabled: true,
  },

  css: ["~/assets/css/main.css"],

  compatibilityDate: "2024-11-01",

  runtimeConfig: {
    oauth: {
      authentik: {
        displayName: "Authentik",
        groups: {
          admin: "",
          publisher: "",
        },
      },
      keycloak: {
        displayName: "Keycloak",
        groups: {
          admin: "",
          publisher: "",
        },
      },
    },
    storage: {
      type: "file",
      thumb: {
        cacheMax: 1000,
      },
      file: {
        base: "./storage",
      },
      s3: {
        accessKey: "",
        secretKey: "",
        bucket: "",
        endpoint: "",
        region: "",
      },
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },
});
