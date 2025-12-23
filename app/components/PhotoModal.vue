<template>
  <UModal
    v-model:open="open"
    fullscreen
  >
    <template #body>
      <UButton
        @click="moveLeft"
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="xl"
        class="z-100 absolute left-4 md:left-8 xl:left-16 top-[50%] -translate-y-[50%]"
      />

      <UnLazyImage
        v-if="photo"
        :key="photo.id"
        :src="`/photo/${photo.album}/${photo.id}/large`"
        :thumbhash="photo.thumbHash"
        :style="`aspect-ratio: ${photo.width}/${photo.height};`"
        class="h-full w-full m-auto object-contain"
        :height="photo.height"
        :width="photo.width"
      />

      <UButton
        @click="moveRight"
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="xl"
        class="z-100 absolute right-4 md:right-8 xl:right-16 top-[50%] -translate-y-[50%]"
      />
    </template>

    <template #actions>
      <UFieldGroup
        v-if="photo"
        class="ml-4"
      >
        <UDrawer
          :title="photo.fileName"
          description="Photo details."
          direction="left"
          inset
        >
          <UButton
            icon="i-lucide-info"
            color="neutral"
            variant="subtle"
          >
            Info
          </UButton>

          <template #content>
            <div class="flex flex-col w-96 my-8 mx-4 gap-4 h-auto">
              <UPageFeature
                :title="dateTitle"
                :description="dateDescription"
                icon="i-lucide-calendar"
              />
              <UPageFeature
                :title="photo.fileName"
                :description="fileDescription"
                icon="i-lucide-image"
              />
              <UPageFeature
                v-if="photo.cameraMake || photo.cameraModel"
                :title="`${photo.cameraMake ?? ''} ${photo.cameraModel ?? ''}`"
                :description="cameraDescription"
                icon="i-lucide-aperture"
              />
              <UPageFeature
                v-if="photo.flash"
                :title="photo.flash.split(', ')[0]"
                :description="photo.flash.split(', ')[1]"
                icon="i-lucide-lightbulb"
              />
              <UPageFeature
                v-if="photo.software"
                :title="photo.software"
                icon="i-lucide-monitor"
              />
              <UPageFeature
                v-if="photo.copyright"
                :title="photo.copyright"
                icon="i-lucide-copyright"
              />
            </div>
          </template>
        </UDrawer>
        <UButton
          :to="`/photo/${photo.album}/${photo.id}/original`"
          icon="i-lucide-download"
          color="neutral"
          variant="subtle"
          :download="photo.fileName"
          external
        >
          Download
        </UButton>
      </UFieldGroup>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { photo as Photo } from "~~/server/database/schema";
import type { SerializeObject } from "nitropack";

const open = ref(false);
const photo =
  defineModel<SerializeObject<Omit<typeof Photo.$inferSelect, "location">>>();
const emit = defineEmits<{ moveLeft: []; moveRight: [] }>();

watch(open, (isOpen) => {
  if (!isOpen) {
    photo.value = undefined;
  }
});

watch(photo, (photo) => {
  open.value = !!photo;
});

const moveLeft = () => {
  if (!photo.value) return;
  emit("moveLeft");
};

const moveRight = () => {
  if (!photo.value) return;
  emit("moveRight");
};

onKeyStroke("ArrowLeft", (e) => moveLeft());
onKeyStroke("ArrowRight", (e) => moveRight());

const dateTitle = computed(() => {
  if (!photo.value) {
    return "Unknown";
  }

  const date = (photo.value.dateTime + photo.value.offsetTime).replace("Z", "");
  return useDateFormat(date, "MMM D YYYY").value;
});

const dateDescription = computed(() => {
  if (!photo.value) {
    return "";
  }

  const date = (photo.value.dateTime + photo.value.offsetTime).replace("Z", "");
  return useDateFormat(date, "ddd HH:mm:ss zzzz").value;
});

const fileDescription = computed(() => {
  if (!photo.value) return "Unknown";
  let description = "";

  description += Math.max(
    Math.round((photo.value.width * photo.value.height) / (1024 * 1024)),
    1,
  );
  description += " MP ";

  description += photo.value.width;
  description += "x";
  description += photo.value.height;
  description += " ";

  description += useDataSize(photo.value.size);
  description += " ";

  return description;
});

const cameraDescription = computed(() => {
  if (!photo.value) return "Unknown";
  let description = "";

  if (photo.value.lens) {
    description += photo.value.lens;
    description += " ";
  }

  if (photo.value.fNumber) {
    description += photo.value.fNumber;
    description += " ";
  }

  if (photo.value.exposureTime) {
    description += photo.value.exposureTime;
    description += "s ";
  }

  if (photo.value.focalLength) {
    description += photo.value.focalLength;
    description += " ";
  }

  if (photo.value.iso) {
    description += "ISO ";
    description += photo.value.iso;
    description += " ";
  }

  return description;
});
</script>
