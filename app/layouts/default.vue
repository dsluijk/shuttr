<template>
  <div>
    <AppHeader />

    <UContainer>
      <slot />
    </UContainer>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const theme =
  route.query.theme === "dark" || route.query.theme === "light"
    ? route.query.theme
    : undefined;

if (theme) {
  useHead({
    bodyAttrs: { class: theme },
  });
}
</script>
