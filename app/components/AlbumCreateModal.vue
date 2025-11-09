<template>
  <UModal
    title="Add Album"
    description="Create a new draft photo album."
  >
    <UButton
      color="primary"
      variant="subtle"
      icon="i-lucide-plus"
      block
    >
      Add Album
    </UButton>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="createAlbum"
      >
        <UFormField
          label="Title"
          name="title"
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
          label="Visibility"
          name="visibility"
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

        <UButton
          type="submit"
          block
        >
          Submit
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();

const visibilityOptions = ref([
  { label: "Public", value: "public", icon: "i-lucide-globe" },
  { label: "Authenticated", value: "authenticated", icon: "i-lucide-users" },
  { label: "Private", value: "private", icon: "i-lucide-lock" },
]);

const schema = z.object({
  title: z
    .string("A title is required")
    .min(4, "Must be at least 4 characters")
    .max(64, "Cannot be longer than 64 characters"),
  description: z
    .string("You must specify a description")
    .min(6, "Must be at least 6 characters")
    .max(512, "Cannot be longer than 512 characters"),
  visibility: z.enum(visibilityOptions.value.map((opt) => opt.value)),
  sharingAllowed: z.boolean(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  title: undefined,
  description: undefined,
  visibility: "public",
  sharingAllowed: true,
});

const createAlbum = async (event: FormSubmitEvent<Schema>) => {
  const createdAlbum = await useRequestFetch()("/api/albums", {
    method: "POST",
    body: event.data,
  });

  toast.add({
    title: "Album created",
    description: `Your album "${createdAlbum.title}" has been created.`,
    icon: "i-lucide-folder-plus",
    color: "success",
  });

  await navigateTo(`/manage/albums/${createdAlbum.slug}`);
};
</script>
