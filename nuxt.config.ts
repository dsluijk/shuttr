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
    public: {
      title: "Shuttr",
      header: "Shuttr Photo Gallery",
      description:
        "Shuttr is a simple to use self-hosted photo gallery for amateurs.",
      links: [
        {
          icon: "i-lucide-link",
          to: "https://dany.dev",
        },
        {
          icon: "i-simple-icons-github",
          to: "https://github.com/dsluijk",
        },
        {
          icon: "i-simple-icons-linkedin",
          to: "https://www.linkedin.com/in/danysluijk/",
        },
      ],
    },
  },

  nitro: {
    experimental: {
      openAPI: true,
    },
  },

  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
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
