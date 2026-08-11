<template>
  <UPage>
    <AnimatedHero
      v-if="!isIframe"
      :title="settings.header"
      :description="settings.description"
    >
      <!-- <div
        class="rounded-lg w-full lg:h-[450px] h-[350px] bg-radial-[at_60%_60%] from-neutral-300 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700"
      /> -->

      <template #links>
        <div class="gap-x-4 inline-flex">
          <Motion
            v-for="(link, index) of settings.links"
            :key="link.id"
            :initial="{
              scale: 1.1,
              opacity: 0,
              filter: 'blur(20px)',
            }"
            :animate="{
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
            }"
            :transition="{
              duration: 0.2,
              delay: 0.2 + index * 0.05,
            }"
          >
            <UButton
              size="md"
              color="neutral"
              variant="ghost"
              target="_blank"
              :icon="link.icon"
              :to="link.to"
              :label="link.label ?? undefined"
            />
          </Motion>
        </div>
      </template>
    </AnimatedHero>

    <UPageBody class="mt-0">
      <Motion
        :class="isIframe ? 'mb-4' : ''"
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.2,
          delay: 0.25,
        }"
      >
        <div
          class="flex flex-wrap flex-col md:flex-row items-center justify-between gap-1.5 max-w-2xl m-auto"
        >
          <div class="flex-1 w-full">
            <UInput
              v-model="searchQuery.search"
              variant="soft"
              icon="i-lucide-search"
              placeholder="Search.."
              class="w-full"
            />
          </div>

          <div class="flex w-full md:w-auto flex-wrap items-center gap-1.5">
            <USelectMenu
              v-model="searchQuery.labels"
              :items="labels"
              :loading="labelsLoading"
              valueKey="id"
              labelKey="title"
              placeholder="Select labels.."
              variant="soft"
              size="md"
              class="w-full md:w-48 overflow-hidden"
              multiple
            >
              <template #default="{ modelValue }">
                <Label
                  v-for="(label, index) of mapLabelIds(modelValue ?? [])"
                  :key="index"
                  :model="label"
                  size="sm"
                  class="truncate max-w-24"
                >
                  {{ label?.title ?? "Unknown" }}
                </Label>
              </template>

              <template #item="{ item: label }">
                <Label :model="label">{{ label.title }}</Label>
              </template>
            </USelectMenu>
          </div>
        </div>
      </Motion>

      <UBlogPosts
        v-if="albums.length > 0"
        class="lg:gap-y-8"
      >
        <Motion
          v-for="album of albums"
          :key="album.id"
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
          :whileInView="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'translateY(0)',
          }"
          :transition="{
            duration: 0.3,
            delay: 0.1,
          }"
          :inViewOptions="{ once: true }"
        >
          <UBlogPost
            :title="album.title"
            :date="album.startDate"
            :to="`/${album.slug}`"
            variant="ghost"
            :ui="{
              header: 'aspect-[4/3]',
              title: 'truncate',
              meta: 'flex-col items-start',
            }"
          >
            <template #header>
              <UnLazyImage
                v-if="album.cover"
                :src="`/photo/${album.id}/${album.cover.id}/thumb`"
                :thumbhash="album.cover.thumbHash"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="rounded-lg w-full h-full bg-radial-[at_60%_60%] from-neutral-300 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700"
              />
            </template>

            <template #badge>
              <div class="flex w-full min-h-6">
                <div
                  v-if="album.albumLabels.length > 0"
                  class="flex gap-2 overflow-hidden flex-wrap"
                >
                  <Label
                    v-for="albumLabel of album.albumLabels"
                    :key="albumLabel.id"
                    :model="albumLabel"
                    size="sm"
                  >
                    {{ albumLabel.title }}
                  </Label>
                </div>
              </div>
            </template>
          </UBlogPost>
        </Motion>
      </UBlogPosts>

      <Motion
        v-else
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
        :whileInView="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translateY(0)',
        }"
        :transition="{
          duration: 0.4,
          delay: 0.5,
        }"
        :inViewOptions="{ once: true }"
      >
        <UEmpty
          variant="naked"
          size="xl"
          icon="i-lucide-file-question-mark"
          title="No galleries found"
          description="It looks like there aren't any galleries available to view for you."
        />
      </Motion>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const isIframe = useDetectIframe();
const settings = useSettings();

useSeoMeta({
  titleTemplate: "",
  title: () => settings.value.header,
  ogTitle: () => settings.value.header,
  description: () => settings.value.description,
  ogDescription: () => settings.value.description,
});

const { data: labels, pending: labelsLoading } = await useFetch("/api/labels");
const mapLabelIds = (labelIds: string[]) =>
  labelIds.map((labelId) =>
    labels.value?.find((label) => label.id === labelId),
  );

const searchQuery = reactive({
  search: "",
  labels: [] as string[],
});

const albums = useState<
  Awaited<ReturnType<typeof $fetch<unknown, "/api/albums">>>
>(() => []);
const hasMore = useState(() => true);

const fetchNextAlbums = async () => {
  const newAlbums = await useRequestFetch()("/api/albums", {
    query: { ...searchQuery, offset: albums.value.length, limit: 20 },
  });

  if (newAlbums.length < 20) {
    hasMore.value = false;
  }

  albums.value.push(...newAlbums);
};

const { reset: resetAlbums } = useInfiniteScroll(
  import.meta.client ? window : undefined,
  fetchNextAlbums,
  {
    distance: 200,
    canLoadMore: () => hasMore.value,
  },
);

watch(searchQuery, () => {
  albums.value = [];
  hasMore.value = true;
  resetAlbums();
});

await callOnce(async () => fetchNextAlbums());
</script>
