<template>
  <USelectMenu
    v-model="selected"
    :items="labels"
    :loading
    :createItem="creatable ? 'always' : false"
    by="id"
    labelKey="title"
    variant="soft"
    multiple
    :ui="{ itemLeadingIcon: 'hidden' }"
    @create="createSelected"
  >
    <template #default="{ modelValue }">
      <Label
        v-for="label of modelValue ?? []"
        :key="label.id"
        :model="label"
        :class="labelClass"
        size="sm"
      >
        {{ label.title }}
      </Label>
    </template>

    <template #item-label="{ item: label }">
      <Label :model="label">{{ label.title }}</Label>
    </template>
  </USelectMenu>
</template>

<script lang="ts" setup>
import type { LabelModel } from "~/composables/useLabels";

const { creatable = false } = defineProps<{
  creatable?: boolean;
  labelClass?: string;
}>();

const model = defineModel<string[]>({ default: () => [] });

const { labels, loading, create } = await useLabels();

const selected = computed<LabelModel[]>({
  get: () => labels.value.filter((label) => model.value.includes(label.id)),
  set: (selection) => (model.value = selection.map((label) => label.id)),
});

const createSelected = async (title: string) => {
  const created = await create(title);
  if (!created) return;

  model.value = [...model.value, created.id];
};
</script>
