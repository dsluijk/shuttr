<template>
  <UPage>
    <AnimatedHero
      title="Favorites"
      description="Every photo you favorited, across all albums."
    />

    <UPageBody class="mt-0">
      <PhotoGrid
        :photos="photos"
        emptyIcon="i-lucide-heart-off"
        emptyTitle="No favorites yet"
        emptyDescription="Favorite a photo in any album and it will show up here."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { manageFavorites } from "~~/shared/utils/abilities";

await authorize(manageFavorites);

const { data: photos } = await useFetch("/api/favorites", {
  default: () => [],
});

useSeoMeta({
  title: "Favorites",
  ogTitle: "Favorites",
});
</script>
