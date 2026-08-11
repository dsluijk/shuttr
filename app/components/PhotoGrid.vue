<template>
  <UScrollArea
    v-if="photos.length > 0"
    ref="scrollArea"
    v-slot="{ item: photo }"
    :items="photos"
    orientation="vertical"
    :virtualize="{
      lanes,
      gap: 16,
      estimateSize: (index: number) => {
        const photo = photos[index];
        if (!photo) return 0;

        const itemWidth = width > 0 ? width : photo.width;
        const laneWidth = (itemWidth - 16 * (lanes - 1)) / lanes;
        return (photo.height / photo.width) * laneWidth;
      },
    }"
  >
    <div class="group relative h-full w-full">
      <UnLazyImage
        :src="`/photo/${photo.album}/${photo.id}/thumb`"
        :thumbhash="photo.thumbHash"
        :style="`aspect-ratio: ${photo.width / photo.height};`"
        class="h-full w-full object-cover rounded-lg"
        @click="() => (openPhoto = photo)"
      />

      <UButton
        v-if="loggedIn"
        icon="i-lucide-heart"
        :color="isFavorite(photo.id) ? 'error' : 'neutral'"
        variant="ghost"
        size="sm"
        :aria-label="
          isFavorite(photo.id) ? 'Remove from favorites' : 'Add to favorites'
        "
        class="absolute top-2 right-2 transition-opacity"
        :class="
          isFavorite(photo.id)
            ? 'opacity-100'
            : 'opacity-0 max-md:opacity-100 group-hover:opacity-100 focus-visible:opacity-100'
        "
        @click.stop="() => toggle(photo.id)"
      />
    </div>
  </UScrollArea>

  <UEmpty
    v-else
    variant="naked"
    size="xl"
    :icon="emptyIcon"
    :title="emptyTitle"
    :description="emptyDescription"
  />

  <PhotoModal
    v-model="openPhoto"
    @move-left="() => changeModal(true)"
    @move-right="() => changeModal()"
  />
</template>

<script setup lang="ts">
import type { photo as Photo } from "~~/server/database/schema";
import type { SerializeObject } from "nitropack";

type GridPhoto = SerializeObject<Omit<typeof Photo.$inferSelect, "location">>;

const props = withDefaults(
  defineProps<{
    photos: GridPhoto[];
    emptyIcon?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  }>(),
  {
    emptyIcon: "i-lucide-file-question-mark",
    emptyTitle: "No photos found",
    emptyDescription: "It looks like there aren't any photos here.",
  },
);

const { loggedIn } = useUserSession();
const { isFavorite, toggle } = useFavorites();

const scrollArea = useTemplateRef("scrollArea");
const { width } = useElementSize(() => scrollArea.value?.$el);

const lanes = computed(() =>
  Math.max(1, Math.min(3, Math.floor(width.value / 300))),
);

const openPhoto = ref<GridPhoto | undefined>(undefined);

const changeModal = (backwards: boolean = false) => {
  if (openPhoto.value === undefined || props.photos.length === 0) return;

  const offset = backwards ? -1 : 1;
  const photoIndex = props.photos.findIndex(
    (photo) => photo.id === openPhoto.value?.id,
  );

  const nextIndex =
    (((photoIndex + offset) % props.photos.length) + props.photos.length)
    % props.photos.length;
  openPhoto.value = props.photos[nextIndex];
};
</script>
