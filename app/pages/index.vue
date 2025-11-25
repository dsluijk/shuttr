<template>
  <UPage>
    <AnimatedHero
      title="Shuttr Photo Gallery"
      description="Shuttr is a simple to use self-hosted photo gallery for amateurs."
    >
      <div
        class="rounded-lg w-full lg:h-[450px] h-[350px] bg-radial-[at_60%_60%] from-neutral-300 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700"
      />

      <template #links>
        <div class="gap-x-4 inline-flex">
          <Motion
            v-for="(link, index) of socials"
            :key="index"
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
              v-bind="{
                size: 'md',
                color: 'neutral',
                variant: 'ghost',
                ...link,
              }"
            />
          </Motion>
        </div>
      </template>
    </AnimatedHero>

    <UPageBody v-if="albums">
      <Motion
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
              variant="soft"
              icon="i-lucide-search"
              placeholder="Search..."
              class="w-full"
              disabled
            />
          </div>

          <div class="flex w-full md:w-auto flex-wrap items-center gap-1.5" />
        </div>
      </Motion>

      <UBlogPosts
        v-if="albums.length > 0"
        class="lg:gap-y-8"
      >
        <Motion
          v-for="(album, index) of albums"
          :key="index"
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
              <div v-if="album.albumLabels.length > 0">
                <UBadge
                  v-for="albumLabel of album.albumLabels"
                  :key="albumLabel.labelId"
                  :variant="albumLabel.label.style"
                  size="sm"
                >
                  {{ albumLabel.label.title }}
                </UBadge>
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
const { data: albums } = await useFetch("/api/albums");

useSeoMeta({
  titleTemplate: "",
  title: "Shuttr",
  ogTitle: "Shuttr",
  description: "Shuttr Photo Gallery",
  ogDescription: "Shuttr Photo Gallery",
});
</script>
