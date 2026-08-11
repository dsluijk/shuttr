<template>
  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <UMain class="relative">
        <NuxtPage />
      </UMain>
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const settings = useSettings();

useHead(() => ({
  titleTemplate: `%s - ${settings.value.title}`,
}));
</script>
