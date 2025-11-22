<template>
  <UPage v-if="album">
    <AnimatedHero
      :title="album.title"
      :description="album.description"
    >
      <UnLazyImage
        v-if="album.cover"
        :src="`/photo/${album.id}/${album.cover.id}/large`"
        :thumbhash="album.cover.thumbHash"
        class="w-full lg:h-[450px] h-[350px] rounded-lg object-cover object-center"
      />
    </AnimatedHero>

    <UPageBody class="mt-0">
      <UPageGrid v-if="album.photos.length > 0">
        <Motion
          v-for="photo of album.photos"
          :key="photo.id"
          :initial="{
            scale: 1.1,
            opacity: 0,
            transform: 'translateY(10px)',
          }"
          :animate="{
            scale: 1.08,
            opacity: 0.6,
            transform: 'translateY(10px)',
          }"
          :whileInView="{
            scale: 1,
            opacity: 1,
            transform: 'translateY(0)',
          }"
          :transition="{
            duration: 0.2,
            delay: 0.15,
          }"
          :inViewOptions="{ once: true }"
          asChild
        >
          <PhotoModal :photo="photo">
            <UnLazyImage
              :src="`/photo/${album.id}/${photo.id}/thumb`"
              :thumbhash="photo.thumbHash"
              :style="`aspect-ratio: 4/${3 * getAspectRows(photo)}; grid-row: span ${getAspectRows(photo)};`"
              :class="`h-full w-full object-cover rounded-lg`"
            />
          </PhotoModal>
        </Motion>
      </UPageGrid>

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

useSeoMeta({
  title: album.value.title,
  ogTitle: album.value.title,
  description: album.value.description,
  ogDescription: album.value.description,
});

const getAspectRows = (photo: (typeof album.value.photos)[number]) => {
  return Math.round(Math.max(photo.height / photo.width, 1));
};
</script>
