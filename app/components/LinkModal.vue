<template>
  <UModal
    v-model:open="modalOpen"
    :title="link ? 'Edit Link' : 'Add Link'"
    :description="
      link
        ? 'Change an existing link.'
        : 'Create a new link, shown on the main page and in the footer.'
    "
  >
    <slot>
      <UButton
        color="primary"
        variant="subtle"
        icon="i-lucide-plus"
        block
      >
        Add Link
      </UButton>
    </slot>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="saveLink"
      >
        <UFormField
          label="Icon"
          name="icon"
          required
        >
          <InputIcon
            v-model="state.icon"
            :collections="['lucide', 'simple-icons']"
          />
        </UFormField>

        <UFormField
          label="Destination"
          name="to"
          required
        >
          <UInput
            v-model="state.to"
            placeholder="https://example.com"
            variant="soft"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Label"
          name="label"
          description="Leave empty to show the icon only."
        >
          <UInput
            v-model="state.label"
            placeholder="Example"
            variant="soft"
            size="lg"
            class="w-full"
            :maxlength="32"
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
import type { SettingsLink } from "~~/server/utils/settings";

const props = defineProps<{
  link?: SettingsLink;
}>();

const emit = defineEmits<{
  save: [SettingsLink];
}>();

const modalOpen = ref(false);
const toast = useToast();

const schema = z.object({
  icon: z.string("An icon is required"),
  to: z
    .url({
      error: "A valid URL is required",
      normalize: true,
      protocol: /^(https)|(mailto)$/,
    })
    .max(512),
  label: z.string().max(32, "Cannot be longer than 32 characters").optional(),
});

type SchemaIn = z.input<typeof schema>;
type SchemaOut = z.output<typeof schema>;

const state = reactive<Partial<SchemaIn>>({
  icon: props.link?.icon,
  to: props.link?.to,
  label: props.link?.label ?? undefined,
});

watch(modalOpen, (open) => {
  if (!open) return;

  state.icon = props.link?.icon;
  state.to = props.link?.to;
  state.label = props.link?.label ?? undefined;
});

type LinkBody = Omit<SchemaOut, "label"> & { label: string | null };

const createLink = (body: LinkBody) =>
  useRequestFetch()("/api/links", { method: "POST", body });

const updateLink = (id: string, body: LinkBody) =>
  useRequestFetch()(`/api/links/${id}`, { method: "PATCH", body });

const saveLink = async (event: FormSubmitEvent<SchemaOut>) => {
  const body = { ...event.data, label: event.data.label || null };

  const savedLink = props.link
    ? await updateLink(props.link.id, body)
    : await createLink(body);

  if (!savedLink) return;

  toast.add({
    title: props.link ? "Link updated" : "Link created",
    description: `The link to "${savedLink.to}" has been saved.`,
    icon: "i-lucide-link",
    color: "success",
  });

  emit("save", savedLink);
  modalOpen.value = false;
};
</script>
