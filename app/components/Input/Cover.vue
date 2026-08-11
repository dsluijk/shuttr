<template>
  <div class="space-y-2 max-w-md m-auto">
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-light">Cover image</span>

      <UButton
        v-if="src"
        icon="i-lucide-trash"
        color="error"
        variant="ghost"
        size="xs"
        :loading="removing"
        :disabled="uploading"
        aria-label="Remove the cover image"
        @click="removeCover"
      />
    </div>

    <UFileUpload
      v-model="file"
      :accept="COVER_TYPES.join(',')"
      :disabled="busy"
    >
      <template #default="{ open }">
        <div
          ref="dropzone"
          role="button"
          :tabindex="busy ? -1 : 0"
          aria-label="Upload a cover image"
          class="flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors"
          :class="[
            busy ? 'cursor-wait' : 'cursor-pointer',
            isOverDropZone ? 'border-primary' : 'border-accented',
            busy ? '' : 'hover:border-primary',
            src ? '' : 'p-3',
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
            alt="Cover image"
            provider="none"
            class="h-full w-full object-cover"
          />
          <span
            v-else
            class="text-muted text-sm"
          >
            Drop or select a cover image
          </span>
        </div>
      </template>
    </UFileUpload>
  </div>
</template>

<script setup lang="ts">
import type { FetchError } from "ofetch";

const COVER_TYPES = ["image/png", "image/jpeg", "image/webp"];

const toast = useToast();
const settings = useSettings();

const file = ref<File | null>(null);
const uploading = ref(false);
const removing = ref(false);
const busy = computed(() => uploading.value || removing.value);

const src = computed(() =>
  settings.value.cover ? `/cover/${settings.value.cover}` : null,
);

const dropzone = useTemplateRef<HTMLDivElement>("dropzone");

const { isOverDropZone } = useDropZone(dropzone, {
  dataTypes: COVER_TYPES,
  multiple: false,
  onDrop: (files) => {
    const dropped = files?.[0];
    if (dropped && !busy.value) file.value = dropped;
  },
});

watch(file, (newFile) => {
  if (newFile) return uploadCover(newFile);
});

const uploadCover = async (cover: File) => {
  uploading.value = true;

  try {
    settings.value = await useRequestFetch()("/api/settings/cover", {
      method: "POST",
      headers: { "content-type": cover.type || "application/octet-stream" },
      body: cover,
    });

    toast.add({
      title: "Cover updated",
      description: "The cover image has been saved.",
      icon: "i-lucide-image",
      color: "success",
    });
  } catch (error) {
    console.error(error);
    const reason = (error as FetchError)?.data?.statusMessage;

    toast.add({
      title: "Upload failed",
      description: reason ?? "The cover image could not be uploaded.",
      icon: "i-lucide-image-off",
      color: "error",
    });
  } finally {
    uploading.value = false;
    file.value = null;
  }
};

const removeCover = async () => {
  removing.value = true;

  try {
    settings.value = await useRequestFetch()("/api/settings/cover", {
      method: "DELETE",
    });

    toast.add({
      title: "Cover removed",
      description: "The cover image has been removed.",
      icon: "i-lucide-image-off",
      color: "error",
    });
  } finally {
    removing.value = false;
  }
};
</script>
