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
const innerModel = ref();

const {
  data: availableIcons,
  status: loadingStatus,
  execute: loadIcons,
} = useFetch("/api/icons", {
  immediate: false,
});

const onOpen = () => {
  if (availableIcons.value?.length) return;
  loadIcons();
};

const model = defineModel<string | null>();

watch(innerModel, (newVal) => {
  model.value = newVal?.icon ?? undefined;
});

watch(model, (newVal) => {
  innerModel.value = newVal
    ? availableIcons.value?.find((icon) => icon.icon === newVal)
    : undefined;
});
</script>
