export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "neutral",
    },
    pageBody: {
      base: "pb-12",
    },
    pageHero: {
      slots: {
        container: "py-2 sm:py-4 lg:py-8",
        headline: "flex items-center max-w-4xl justify-center mx-auto",
        title:
          "text-shadow-md max-w-2xl mx-auto mt-8 text-pretty text-3xl sm:text-4xl lg:text-5xl",
        description:
          "mt-2 text-md mx-auto max-w-2xl text-pretty sm:text-md text-muted",
        links: "my-4 flex-col justify-center items-center",
        footer: "mt-2",
      },
    },
    header: {
      slots: {
        root: "border-none",
      },
    },
    footer: {
      slots: {
        root: "z-10 bg-default",
        left: "text-muted text-xs",
      },
    },
  },
});
