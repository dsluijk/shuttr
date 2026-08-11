<template>
  <USelectMenu
    v-model="innerModel"
    :items="availableIcons"
    :icon="innerModel?.icon ?? 'i-lucide-circle-question-mark'"
    :loading="loadingStatus === 'pending'"
    labelKey="name"
    placeholder="Select icon"
    size="lg"
    variant="soft"
    class="w-full"
    virtualize
    @update:open="onOpen"
  />
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    collections?: ("lucide" | "simple-icons")[];
  }>(),
  {
    collections: () => ["lucide"],
  },
);

const innerModel = ref<{ name: string; icon: string }>();

const {
  data: availableIcons,
  status: loadingStatus,
  execute: loadIcons,
} = useFetch("/api/icons", {
  query: { collections: props.collections },
  immediate: false,
});

const onOpen = () => {
  if (availableIcons.value?.length) return;
  loadIcons();
};

const model = defineModel<string | null>();

const iconLabel = (icon: string) =>
  icon
    .replace(/^i-(?:lucide|simple-icons)-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

watch(innerModel, (newVal) => {
  model.value = newVal?.icon ?? undefined;
});

watch(
  [model, availableIcons],
  ([newVal]) => {
    if (!newVal) {
      innerModel.value = undefined;
      return;
    }

    innerModel.value = availableIcons.value?.find(
      (icon) => icon.icon === newVal,
    ) ?? { name: iconLabel(newVal), icon: newVal };
  },
  { immediate: true },
);
</script>
