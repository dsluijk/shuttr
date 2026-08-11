<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-light">{{ label }}</span>

      <UButton
        v-if="src"
        icon="i-lucide-trash"
        color="error"
        variant="ghost"
        size="xs"
        :loading="removing"
        :disabled="uploading"
        :aria-label="`Remove the ${mode} mode logo`"
        @click="removeLogo"
      />
    </div>

    <UFileUpload
      v-model="file"
      :accept="LOGO_TYPES.join(',')"
      :disabled="busy"
    >
      <template #default="{ open }">
        <div
          ref="dropzone"
          role="button"
          :tabindex="busy ? -1 : 0"
          :aria-label="`Upload a ${mode} mode logo`"
          class="flex h-20 w-full items-center justify-center rounded-lg border border-dashed p-3 transition-colors"
          :class="[
            mode === 'light' ? 'bg-white' : 'bg-neutral-900',
            busy ? 'cursor-wait' : 'cursor-pointer',
            isOverDropZone ? 'border-primary' : 'border-accented',
            busy ? '' : 'hover:border-primary',
          ]"
          @click="!busy && open()"
          @keydown.space.prevent
          @keyup.enter.space="!busy && open()"
        >
          <UIcon
            v-if="busy"
            name="i-lucide-loader-circle"
            class="text-muted size-5 animate-spin"
          />
          <NuxtImg
            v-else-if="src"
            :src="src"
            :alt="`${label} logo`"
            provider="none"
            class="h-10 w-auto max-w-full object-contain"
          />
          <span
            v-else
            class="text-sm"
            :class="mode === 'light' ? 'text-neutral-500' : 'text-neutral-400'"
          >
            Drop or select a logo
          </span>
        </div>
      </template>
    </UFileUpload>
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from "ofetch";

import type { LogoMode } from "~~/server/utils/logo";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];

const props = defineProps<{
  mode: LogoMode;
}>();

const toast = useToast();
const settings = useSettings();

const file = ref<File | null>(null);
const uploading = ref(false);
const removing = ref(false);
const busy = computed(() => uploading.value || removing.value);

const label = computed(() =>
  props.mode === "light" ? "Light mode" : "Dark mode",
);

const src = computed(() => {
  const id =
    props.mode === "light" ? settings.value.logoLight : settings.value.logoDark;

  return id ? `/logo/${id}` : null;
});

const dropzone = useTemplateRef<HTMLDivElement>("dropzone");

const { isOverDropZone } = useDropZone(dropzone, {
  dataTypes: LOGO_TYPES,
  multiple: false,
  onDrop: (files) => {
    const dropped = files?.[0];
    if (dropped && !busy.value) file.value = dropped;
  },
});

watch(file, (newFile) => {
  if (newFile) return uploadLogo(newFile);
});

const uploadLogo = async (logo: File) => {
  uploading.value = true;

  try {
    settings.value = await useRequestFetch()(
      `/api/settings/logo/${props.mode}`,
      {
        method: "POST",
        headers: { "content-type": logo.type || "application/octet-stream" },
        body: logo,
      },
    );

    toast.add({
      title: "Logo updated",
      description: `The ${props.mode} mode logo has been saved.`,
      icon: "i-lucide-image",
      color: "success",
    });
  } catch (error) {
    const reason = (error as FetchError)?.data?.statusMessage;

    toast.add({
      title: "Upload failed",
      description: reason ?? "The logo could not be uploaded.",
      icon: "i-lucide-image-off",
      color: "error",
    });
  } finally {
    uploading.value = false;
    file.value = null;
  }
};

const removeLogo = async () => {
  removing.value = true;

  try {
    settings.value = await useRequestFetch()(
      `/api/settings/logo/${props.mode}`,
      { method: "DELETE" },
    );

    toast.add({
      title: "Logo removed",
      description: `The ${props.mode} mode logo has been removed.`,
      icon: "i-lucide-image-off",
      color: "error",
    });
  } finally {
    removing.value = false;
  }
};
</script>
