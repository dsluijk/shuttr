<template>
  <div v-if="album">
    <UPageHeader
      :title="album.title"
      :description="album.description"
      headline="Editting Album"
      :links="[
        {
          label: 'Back',
          icon: 'i-lucide-arrow-left',
          to: '/manage/albums',
          variant: 'soft',
        },
        {
          label: 'View',
          icon: 'i-lucide-eye',
          to: `/${album.slug}`,
          color: 'primary',
          variant: 'soft',
        },
      ]"
    />

    <UPageBody>
      <UFileUpload
        v-model="files"
        label="Drop your image here to upload"
        description="PNG or JPG (max. 50MB)"
        icon="i-lucide-image-plus"
        accept="image/png,image/jpg,image/jpeg"
        layout="list"
        size="xl"
        :fileDelete="false"
        class="w-full"
        multiple
      >
        <template #files="{ files: uploadFiles }">
          <UPageCard
            variant="subtle"
            class="mt-4 max-h-64 overflow-y-auto"
          >
            <UProgress
              v-model="uploaded"
              :max="uploadFiles.length"
              size="lg"
              status
            />
          </UPageCard>
        </template>
      </UFileUpload>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import pLimit from "p-limit";

const route = useRoute();
const { data: album } = await useFetch(`/api/albums/${route.params.slug}`);

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: "Album Not Found" });
}

const limit = pLimit(4);
const files = ref([]);
const uploaded = ref(0);

const uploadFile = async (file: File) => {
  await $fetch(`/api/albums/${album.value.slug}/upload`, {
    method: "POST",
    retry: 3,
    headers: {
      "Content-Type": file.type,
    },
    body: await file.bytes(),
  });

  uploaded.value++;
};

watchArray(files, (newFiles, oldFiles, added) => {
  for (const newFile of added) {
    limit(() => uploadFile(newFile));
  }
});
</script>
