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
const config = useRuntimeConfig().public;

useSeoMeta({
  titleTemplate: `%s - ${config.title}`,
});
</script>
