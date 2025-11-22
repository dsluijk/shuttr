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

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
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

useSeoMeta({
  title: props.error.message,
  ogTitle: props.error.message,
  description: `Error - ${props.error.message}`,
  ogDescription: `Error - ${props.error.message}`,
});
</script>
