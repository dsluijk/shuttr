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

      <template #links>
        <span>
          <NuxtTime
            :datetime="album.startDate"
            year="numeric"
            month="long"
            day="numeric"
          />
          <span v-if="album.startDate !== album.endDate">&nbsp;-&nbsp;</span>
          <NuxtTime
            v-if="album.startDate !== album.endDate"
            :datetime="album.endDate"
            year="numeric"
            month="long"
            day="numeric"
          />
        </span>
        <div class="flex flex-col mt-4 items-center justify-center">
          <div class="flex items-center justify-center">
            <Label
              v-for="albumLabel of album.albumLabels"
              :key="albumLabel.labelId"
              :model="albumLabel.label"
              size="lg"
              class="mx-1"
            >
              {{ albumLabel.label.title }}
            </Label>
          </div>
          <USeparator
            v-if="album.albumLabels.length > 0"
            class="my-3 max-w-64"
          />
          <div class="flex items-center justify-center">
            <UBadge
              v-if="!album.published"
              icon="i-lucide-pencil-line"
              color="warning"
              variant="soft"
              size="lg"
              class="mx-1"
            >
              Draft
            </UBadge>
            <UBadge
              v-if="album.visibility === 'public'"
              icon="i-lucide-globe"
              color="success"
              variant="soft"
              size="lg"
              class="mx-1"
            >
              Public
            </UBadge>
            <UBadge
              v-if="album.visibility === 'authenticated'"
              icon="i-lucide-users"
              color="warning"
              variant="soft"
              size="lg"
              class="mx-1"
            >
              Authenticated
            </UBadge>
            <UBadge
              v-if="album.visibility === 'private'"
              icon="i-lucide-lock"
              color="error"
              variant="soft"
              size="lg"
              class="mx-1"
            >
              Private
            </UBadge>
            <UButton
              v-if="canEditAlbums"
              icon="i-lucide-pencil"
              color="neutral"
              variant="soft"
              size="sm"
              :to="`/manage/albums/${album.slug}`"
              class="mx-1"
            >
              Edit
            </UButton>
            <ClientOnly>
              <UButton
                v-if="album.sharingAllowed && shareSupported"
                icon="i-lucide-share-2"
                variant="subtle"
                size="sm"
                class="mx-1"
                @click="() => shareAlbum()"
              >
                Share
              </UButton>
            </ClientOnly>
          </div>
        </div>
      </template>
    </AnimatedHero>

    <UPageBody class="mt-0">
      <UScrollArea
        v-if="album.photos.length > 0"
        ref="scrollArea"
        v-slot="{ item: photo }"
        :items="album.photos"
        orientation="vertical"
        :virtualize="{
          lanes,
          gap: 16,
          estimateSize: (index: number) => {
            if (!album) return 0;
            const photo = album.photos[index];
            if (!photo) return 0;

            const itemWidth = width > 0 ? width : photo.width;
            const laneWidth = (itemWidth - 16 * (lanes - 1)) / lanes;
            return (photo.height / photo.width) * laneWidth;
          },
        }"
      >
        <UnLazyImage
          :src="`/photo/${album.id}/${photo.id}/thumb`"
          :thumbhash="photo.thumbHash"
          :style="`aspect-ratio: ${photo.width / photo.height};`"
          class="h-full w-full object-cover rounded-lg"
          @click="() => (openPhoto = photo)"
        />
      </UScrollArea>

      <UEmpty
        v-else
        variant="naked"
        size="xl"
        icon="i-lucide-file-question-mark"
        title="No photos found"
        description="It looks like there aren't any photos in this album."
      />

      <PhotoModal
        v-model="openPhoto"
        @move-left="() => changeModal(true)"
        @move-right="() => changeModal()"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import type { photo as Photo } from "~~/server/database/schema";
import type { SerializeObject } from "nitropack";

const canEditAlbums = await allows(editAlbums);

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
  ogImage: album.value.cover
    ? `/photo/${album.value.id}/${album.value.cover.id}/thumb`
    : undefined,
  twitterCard: album.value.cover ? "summary_large_image" : undefined,
});

const scrollArea = useTemplateRef("scrollArea");
const { width } = useElementSize(() => scrollArea.value?.$el);

const lanes = computed(() =>
  Math.max(1, Math.min(4, Math.floor(width.value / 300))),
);

const openPhoto = ref<
  SerializeObject<Omit<typeof Photo.$inferSelect, "location">> | undefined
>(undefined);

const changeModal = (backwards: boolean = false) => {
  if (openPhoto.value === undefined || album.value === undefined) return;

  const offset = backwards ? -1 : 1;
  const photoIndex = album.value.photos.findIndex(
    (photo) => photo.id === openPhoto.value?.id,
  );

  const nextIndex =
    (((photoIndex + offset) % album.value.photos.length)
      + album.value.photos.length)
    % album.value.photos.length;
  openPhoto.value = album.value.photos[nextIndex];
};

const { share, isSupported: shareSupported } = useShare();
const shareAlbum = () => {
  share({
    title: album.value?.title ?? "",
    text: `Check out the '${album.value?.title ?? ""}' album!`,
    url: location.href,
  });
};
</script>
