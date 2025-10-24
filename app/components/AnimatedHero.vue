<template>
  <UPageHero>
    <template #headline>
      <Motion
        v-if="image"
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
          :src="image"
          :alt="title"
          class="rounded-lg w-full lg:h-[350px] h-[250px] object-cover object-center"
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
