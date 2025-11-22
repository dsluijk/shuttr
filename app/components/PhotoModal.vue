<template>
  <UModal :ui="{ content: 'max-w-screen w-auto' }">
    <slot />

    <template #content>
      <UnLazyImage
        :src="`/photo/${photo.album}/${photo.id}/large`"
        :thumbhash="photo.thumbHash"
        :style="`aspect-ratio: ${photo.width}/${photo.height};`"
        class="max-h-screen max-w-[96vw] object-contain"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { photo as Photo } from "~~/server/database/schema";
import type { SerializeObject } from "nitropack";

defineProps<{
  photo: SerializeObject<Omit<typeof Photo.$inferSelect, "location">>;
}>();
</script>
