<template>
  <UEmpty
    variant="naked"
    size="xl"
    icon="i-lucide-split"
    loading
    title="Redirecting.."
    description="It seems like you got lost. Let's get you back on track."
    :actions="[
      {
        label: 'Go now',
        icon: 'i-lucide-send',
        size: 'md',
        variant: 'soft',
        to,
      },
    ]"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  to: string;
}>();

await navigateTo(props.to);
</script>
