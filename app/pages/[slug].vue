<template>
  <UPage v-if="album">
    <AnimatedHero :title="album.title" :description="album.description" />

    <UPageBody class="mt-0">
      <UPageColumns v-if="album.photos.length > 0">
        <Motion
          v-for="(photo, index) in album.photos"
          :key="index"
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)',
            transform: 'translateY(10px)',
          }"
          :animate="{
            scale: 1.08,
            opacity: 0.6,
            filter: 'blur(10px)',
            transform: 'translateY(10px)',
          }"
          :while-in-view="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'translateY(0)',
          }"
          :transition="{
            duration: 0.2,
            delay: 0.15,
          }"
          :in-view-options="{ once: true }"
        >
          <UnLazyImage
            :src="`/photo/${photo.id}/thumb`"
            :thumbhash="photo.thumbHash"
            :width="photo.width"
            :height="photo.height"
            :style="`aspect-ratio: ${photo.width}/${photo.height};`"
            class="rounded-lg"
          />
        </Motion>
      </UPageColumns>

      <UEmpty
        v-else
        variant="naked"
        size="xl"
        icon="i-lucide-file-question-mark"
        title="No photos found"
        description="It looks like there aren't any photos in this album."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const route = useRoute();
const { data: album } = await useFetch(`/api/albums/${route.params.slug}`);

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: "Album Not Found" });
}
</script>
