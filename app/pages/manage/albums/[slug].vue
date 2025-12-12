<template>
  <div v-if="album">
    <UPageHeader
      :title="album.title"
      headline="Editting Album"
      :links="actions"
    >
      <template #description>
        <span>{{ album.description }}</span>
        <div class="mt-4">
          <UBadge
            v-for="albumLabel of album.albumLabels"
            :key="albumLabel.labelId"
            :variant="albumLabel.label.style"
            size="lg"
            class="mx-1"
          >
            {{ albumLabel.label.title }}
          </UBadge>
        </div>
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageCard>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="updateAlbum"
        >
          <UFormField
            label="Title"
            name="title"
            required
          >
            <UInput
              v-model="state.title"
              placeholder="Trip to Tokyo"
              variant="soft"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="state.description"
              placeholder="Add a description.."
              variant="soft"
              :maxrows="3"
              size="lg"
              autoresize
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Album Date"
            name="date"
            required
          >
            <CalendarInput
              v-model="state.date"
              :maxValue="maxDate"
            />
          </UFormField>

          <UFormField
            label="Labels"
            name="labels"
          >
            <USelectMenu
              v-model="state.labels"
              :items="labels"
              :loading="labelsLoading"
              valueKey="id"
              labelKey="title"
              createItem="always"
              placeholder="Enter labels.."
              variant="soft"
              size="lg"
              class="w-full"
              multiple
              @create="(labelTitle) => createLabel(labelTitle)"
            >
              <template #default="{ modelValue }">
                <UBadge
                  v-for="(label, index) of mapLabelIds(modelValue ?? [])"
                  :key="index"
                  size="sm"
                  :variant="label?.style"
                >
                  {{ label?.title ?? "Unknown" }}
                </UBadge>
              </template>

              <template #item-label="{ item: label }">
                <UBadge :variant="label.style">{{ label.title }}</UBadge>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField
            label="Visibility"
            name="visibility"
            required
          >
            <USelect
              v-model="state.visibility"
              :items="visibilityOptions"
              variant="soft"
              size="lg"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="state.visibility !== 'public'"
            label="Sharing Allowed"
            name="sharingAllowed"
          >
            <UCheckbox
              v-model="state.sharingAllowed"
              label="Allow link sharing to view album"
              size="lg"
            />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton
              :icon="album.published ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :color="album.published ? 'warning' : 'success'"
              variant="soft"
              size="lg"
              :disabled="!album.published && album.photos.length == 0"
              @click="() => publishAlbum()"
            >
              {{ album.published ? "Unpublish" : "Publish" }}
            </UButton>

            <UButton
              icon="i-lucide-save"
              type="submit"
              size="lg"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </UPageCard>

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
      />

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
import * as z from "zod";
import pLimit from "p-limit";
import type { ButtonProps } from "@nuxt/ui";
import { CalendarDate, fromDate } from "@internationalized/date";

const route = useRoute();
const toast = useToast();

const { data: album } = await useFetch(`/api/albums/${route.params.slug}`, {
  deep: true,
});

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: "Album Not Found" });
}

const { data: labels, pending: labelsLoading } = await useFetch("/api/labels", {
  deep: true,
});

const actions = computed<ButtonProps[]>(() => [
  {
    label: "Back",
    icon: "i-lucide-arrow-left",
    to: "/manage/albums",
    variant: "soft",
  },
  {
    label: "View",
    icon: "i-lucide-album",
    to: `/${album.value?.slug}`,
    color: "primary",
    variant: "soft",
  },
]);

useSeoMeta({
  title: `Manage "${album.value.title}"`,
  ogTitle: `Manage "${album.value.title}"`,
  description: "Manage photo album",
  ogDescription: "Manage photo album",
});

const now = new Date();
const maxDate = new CalendarDate(
  now.getFullYear(),
  now.getMonth() + 1,
  now.getDate(),
);

const visibilityOptions = ref([
  { label: "Public", value: "public", icon: "i-lucide-globe" },
  { label: "Authenticated", value: "authenticated", icon: "i-lucide-users" },
  { label: "Private", value: "private", icon: "i-lucide-lock" },
]);

const schema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 4 characters")
    .max(64, "Cannot be longer than 64 characters"),
  description: z
    .string("You must specify a description")
    .max(512, "Cannot be longer than 512 characters"),
  date: dateRangeValidator(true),
  labels: z.array(z.cuid2()).max(4).default([]),
  visibility: z.enum(visibilityOptions.value.map((opt) => opt.value)),
  sharingAllowed: z.boolean(),
});

type SchemaIn = z.input<typeof schema>;
type SchemaOut = z.output<typeof schema>;

const state = shallowReactive<Partial<SchemaIn>>({
  title: album.value.title,
  description: album.value.description,
  date: {
    start: fromDate(new Date(album.value.startDate)),
    end: fromDate(new Date(album.value.endDate)),
  },
  labels: album.value.albumLabels.map((label) => label.labelId),
  visibility: album.value.visibility,
  sharingAllowed: album.value.sharingAllowed,
});

const mapLabelIds = (labelIds: string[]) =>
  labelIds.map((labelId) =>
    labels.value?.find((label) => label.id === labelId),
  );

const updateAlbum = () => {
  console.log(state);
};

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

const publishAlbum = async () => {
  if (!album.value) return;

  const publish = !album.value.published;
  await useRequestFetch()(`/api/albums/${album.value.slug}/publish`, {
    method: publish ? "POST" : "DELETE",
  });

  album.value.published = publish;
  toast.add({
    title: publish ? "Album Published" : "Album Unpublished",
    description: `The album has been ${!publish ? "un" : ""}published. It is ${publish ? "now" : "no longer"} visible.`,
    icon: publish ? "i-lucide-eye" : "i-lucide-eye-off",
    color: publish ? "success" : "warning",
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
