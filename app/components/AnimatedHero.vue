<template>
  <UPageHero>
    <template #headline>
      <Motion
        class="w-full"
        :initial="{
          scale: 1.05,
          opacity: 0.0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.2,
          delay: 0.05,
        }"
      >
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="title"
          class="rounded-lg w-full lg:h-[350px] h-[250px] object-cover object-center"
        />

        <div
          v-else
          class="rounded-lg w-full lg:h-[350px] h-[250px] bg-radial-[at_60%_60%] from-neutral-300 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700"
        />
      </Motion>
    </template>

    <template #title>
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
          duration: 0.25,
          delay: 0.1,
        }"
      >
        {{ title }}
      </Motion>
    </template>

    <template #description>
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
          duration: 0.25,
          delay: 0.15,
        }"
      >
        {{ description }}
      </Motion>
    </template>

    <template #links>
      <slot name="links" />
    </template>
  </UPageHero>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  image?: string;
}>();
</script>
