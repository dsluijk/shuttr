export default defineNuxtPlugin({
  name: "authz-resolver",
  parallel: true,
  setup() {
    return {
      provide: {
        authorization: {
          resolveClientUser: () => useUserSession().user.value,
        },
      },
    };
  },
});
