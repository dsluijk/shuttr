<template>
  <UPage>
    <AnimatedHero
      title="Shuttr Photo Gallery"
      description="Shuttr is a simple to use self-hosted photo gallery for amateurs."
      image="https://picsum.photos/seed/header/1920/1080"
    >
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

    <UPageBody>
      <UBlogPosts class="lg:gap-y-8">
        <Motion
          v-for="(post, index) in posts"
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
          :while-in-view="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'translateY(0)',
          }"
          :transition="{
            duration: 0.3,
            delay: 0.1,
          }"
          :in-view-options="{ once: true }"
        >
          <UBlogPost v-bind="post" variant="ghost" />
        </Motion>
      </UBlogPosts>

      <!-- <Motion
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
          delay: 0.5,
        }"
        :in-view-options="{ once: true }"
      >
        <UEmpty
          variant="naked"
          size="xl"
          icon="i-lucide-file-question-mark"
          title="No galleries found"
          description="It looks like there aren't any galleries available to view for you."
        />
      </Motion> -->
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const posts = [
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/a/1920/1080",
    to: "/blabla",
  },
  {
    title: "Throw an error",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/b/1920/1080",
    to: "/yeet",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/c/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/d/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/e/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/f/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/g/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/h/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/i/1920/1080",
    to: "/blabla",
  },
  {
    title: "Hello world",
    date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
    image: "https://picsum.photos/seed/j/1920/1080",
    to: "/blabla",
  },
];
</script>
