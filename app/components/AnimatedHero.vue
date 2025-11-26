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
        <slot />
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

    <template
      v-if="description"
      #description
    >
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
          delay: 0.2,
        }"
      >
        <slot name="links" />
      </Motion>
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
