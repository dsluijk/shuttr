<template>
  <UPage v-if="page">
    <LandingHero :page />

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
        title="No galleries found"
        description="It looks like there aren't any galleries available to view for you."
      />
    </Motion>
  </UPage>
</template>

<script setup lang="ts">
const page = {
  title: "Trip to Alaska",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ex magna, placerat vel varius eu, vulputate id purus.",
  image: "https://picsum.photos/seed/a/1920/1080",
  date: "Thu Oct 23 2025 20:58:53 GMT+0200 (Central European Summer Time)",
};

const route = useRoute();

if (route.params.slug === "yeet") {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}
</script>
