<template>
  <UPage v-if="album">
    <AnimatedHero
      :title="album.title"
      :description="album.description"
      image="https://picsum.photos/seed/a/1920/1080"
    />

    <UPageBody class="mt-0">
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
          transform: 'translateY(10px)',
        }"
        :animate="{
          scale: 1.08,
          opacity: 0.2,
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
          duration: 0.4,
          delay: 0.3,
        }"
        :in-view-options="{ once: true }"
      >
        <UEmpty
          variant="naked"
          size="xl"
          icon="i-lucide-file-question-mark"
          title="No photos found"
          description="It looks like there aren't any photos in this album."
        />
      </Motion>
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
