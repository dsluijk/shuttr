<template>
  <USelect
    v-model="selected"
    :items="items"
    variant="soft"
    size="lg"
    class="w-full"
  >
    <template #leading>
      <span
        v-if="model"
        class="size-3 rounded-full"
        :class="`bg-${model}-500`"
      />
    </template>

    <template #item-leading="{ item }">
      <span
        class="size-3 rounded-full"
        :class="`bg-${item.value}-500`"
      />
    </template>
  </USelect>
</template>

<script lang="ts" setup generic="T extends ThemeColor">
import type { ThemeColor } from "~~/shared/utils/theme";

const props = defineProps<{
  colors: readonly T[];
}>();

const model = defineModel<T>();

const selected = computed({
  get: () => model.value as ThemeColor | undefined,
  set: (color) => {
    model.value = color as T | undefined;
  },
});

const items = computed(() =>
  props.colors.map((color) => ({
    label: color.charAt(0).toUpperCase() + color.slice(1),
    value: color as ThemeColor,
  })),
);
</script>
