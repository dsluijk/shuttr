<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true,
  },
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
});
</script>

<template>
  <UApp>
    <AppHeader />

    <UContainer>
      <UMain>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UMain>
    </UContainer>

    <AppFooter />
  </UApp>
</template>
