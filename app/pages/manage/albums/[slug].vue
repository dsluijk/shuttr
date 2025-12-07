<template>
  <div v-if="album">
    <UPageHeader
      :title="album.title"
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
    >
      <template #description>
        <span>{{ album.description }}</span>
        <div class="mt-4">
          <UBadge
            v-for="albumLabel of album.albumLabels"
            :key="albumLabel.labelId"
            :variant="albumLabel.label.style"
            size="xl"
          >
            {{ albumLabel.label.title }}
          </UBadge>
        </div>
      </template>
    </UPageHeader>

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
        :ui="{
          files: 'max-h-64 overflow-y-auto bg-elevated/50 p-2 rounded-lg',
        }"
      >
      </UFileUpload>

      <UBlogPosts
        v-if="album.photos.length > 0"
        class="lg:gap-y-4"
      >
        <Motion
          v-for="photo of album.photos"
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
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-spotlight"
                  class="rounded-t-none"
                  block
                  @click="() => setCoverPhoto(photo.id)"
                />

                <UModal
                  title="Are you sure?"
                  :ui="{ footer: 'justify-end' }"
                >
                  <UButton
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash"
                    class="rounded-t-none"
                    block
                  />

                  <template #body>
                    Do you really want to delete this photo? This cannot be
                    undone.
                  </template>

                  <template #footer="{ close }">
                    <UFieldGroup>
                      <UButton
                        label="Delete"
                        color="error"
                        variant="soft"
                        @click="() => deletePhoto(photo.id)"
                      />
                      <UButton
                        label="Cancel"
                        color="neutral"
                        variant="soft"
                        @click="close"
                      />
                    </UFieldGroup>
                  </template>
                </UModal>
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
const files = ref<File[]>([]);
const uploaded = ref(0);

const uploadFile = async (file: File) => {
  if (!album.value) return;

  const form = new FormData();
  form.append("file", file);
  const uploadedPhoto = await useRequestFetch()(
    `/api/albums/${album.value.slug}/photo`,
    {
      method: "POST",
      retry: 2,
      body: form,
    },
  );

  if (uploadedPhoto) {
    files.value = files.value.filter((listFile) => file !== listFile);
    album.value.photos.unshift(uploadedPhoto);
    uploaded.value++;
  }
};

watchArray(files, (_newFiles, _oldFiles, added) => {
  for (const newFile of added) {
    limit(() => uploadFile(newFile));
  }
});

const setCoverPhoto = async (photoId: string) => {
  if (!album.value) return;

  const newCover = await useRequestFetch()(
    `/api/albums/${album.value.slug}/cover`,
    {
      method: "PUT",
      body: {
        photoId: photoId,
      },
    },
  );

  album.value.cover = newCover;
  toast.add({
    title: "Photo Highlighted",
    description: "The selected photo has been set as the cover.",
    icon: "i-lucide-spotlight",
    color: "success",
  });
};

const deletePhoto = async (photoId: string) => {
  if (!album.value) return;

  await useRequestFetch()(`/api/albums/${album.value.slug}/photo/${photoId}`, {
    method: "DELETE",
  });

  album.value.photos = album.value.photos.filter(
    (albumPhoto) => albumPhoto.id !== photoId,
  );
  toast.add({
    title: "Photo Deleted",
    description: "The selected photo has been deleted.",
    icon: "i-lucide-thras",
    color: "error",
  });
};
</script>
