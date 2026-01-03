<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="soft"
      size="lg"
      icon="i-lucide-calendar"
      class="w-full"
      :ui="{
        base: 'text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
      }"
    >
      Pick a color

      <template #leading>
        <span
          :style="`background-color : ${model}`"
          class="size-3 rounded-full bg-primary"
        />
      </template>
    </UButton>

    <template #content>
      <UColorPicker
        v-model="model"
        class="p-2"
      />
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
const model = defineModel<string>();
</script>
