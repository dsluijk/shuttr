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

      <UBlogPosts
        v-if="album.photos.length > 0"
        class="lg:gap-y-4"
      >
        <Motion
          v-for="(photo, index) of album.photos"
          :key="photo.id"
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)',
            transform: 'translateY(10px)',
          }"
          :animate="{
            scale: 1.08,
            opacity: 0.2,
            filter: 'blur(10px)',
            transform: 'translateY(10px)',
          }"
          :whileInView="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            transform: 'translateY(0)',
          }"
          :transition="{
            duration: 0.3,
            delay: 0.1,
          }"
          :inViewOptions="{ once: true }"
        >
          <UBlogPost
            :ui="{
              root: 'rounded-md',
              header: 'aspect-[4/3]',
              body: 'p-0 sm:p-0',
            }"
          >
            <template #header>
              <UnLazyImage
                :src="`/photo/${album.id}/${photo.id}/thumb`"
                :thumbhash="photo.thumbHash"
                :class="`h-full w-full object-cover`"
              />
            </template>

            <template #body>
              <UFieldGroup class="w-full">
                <UButton
                  @click="() => setCoverPhoto(photo)"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-spotlight"
                  class="rounded-t-none"
                  block
                />
                <UButton
                  @click="() => deletePhoto(photo)"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash"
                  class="rounded-t-none"
                  block
                  disabled
                />
              </UFieldGroup>
            </template>
          </UBlogPost>
        </Motion>
      </UBlogPosts>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import pLimit from "p-limit";

const route = useRoute();
const toast = useToast();

const { data: album } = await useFetch(`/api/albums/${route.params.slug}`, {
  deep: true,
  default: () => ({
    cover: null,
    photos: [],
  }),
});

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: "Album Not Found" });
}

useSeoMeta({
  title: `Manage "${album.value.title}"`,
  ogTitle: `Manage "${album.value.title}"`,
  description: "Manage photo album",
  ogDescription: "Manage photo album",
});

const limit = pLimit(2);
const files = ref([]);
const uploaded = ref(0);

const uploadFile = async (file: File) => {
  const uploadedPhoto = await $fetch(`/api/albums/${album.value.slug}/upload`, {
    method: "POST",
    retry: 3,
    headers: {
      "Content-Type": file.type,
    },
    body: await file.bytes(),
  });

  album.value.photos.unshift(uploadedPhoto);
  uploaded.value++;
};

watchArray(files, (newFiles, oldFiles, added) => {
  for (const newFile of added) {
    limit(() => uploadFile(newFile));
  }
});

const setCoverPhoto = async (photo) => {
  await $fetch(`/api/albums/${album.value.slug}/cover`, {
    method: "PUT",
    body: {
      photoId: photo.id,
    },
  });

  album.value.cover = photo;
  toast.add({
    title: "Photo Highlighted",
    description: "The selected photo has been set as the cover.",
    icon: "i-lucide-spotlight",
    color: "success",
  });
};

const deletePhoto = (photo) => {
  console.log(photo);
};
</script>
