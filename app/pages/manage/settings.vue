<template>
  <div>
    <UPageHeader
      title="Settings"
      description="Change global Shuttr settings."
      icon="i-lucide-settings"
    />

    <UPageBody class="space-y-6">
      <UPageCard
        title="Branding"
        description="The name and the looks of the gallery."
        variant="subtle"
      >
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="saveSettings"
        >
          <UFormField
            label="Title"
            name="title"
            description="Shown in the header and the browser tab."
            required
          >
            <UInput
              v-model="state.title"
              variant="soft"
              size="xl"
              class="w-full"
              :maxlength="32"
            />
          </UFormField>

          <UFormField
            label="Header"
            name="header"
            description="The big title shown on the main page."
            required
          >
            <UInput
              v-model="state.header"
              variant="soft"
              size="lg"
              class="w-full"
              :maxlength="64"
            />
          </UFormField>

          <UFormField
            label="Description"
            name="description"
            description="Shown below the header, and used for link previews."
            required
          >
            <UTextarea
              v-model="state.description"
              variant="soft"
              size="lg"
              class="w-full"
              :rows="3"
              :maxlength="512"
            />
          </UFormField>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormField
              label="Primary color"
              name="primaryColor"
              description="Used for buttons, links and highlights."
              required
            >
              <InputThemeColor
                v-model="state.primaryColor"
                :colors="primaryColors"
              />
            </UFormField>

            <UFormField
              label="Neutral color"
              name="neutralColor"
              description="Used for backgrounds, borders and text."
              required
            >
              <InputThemeColor
                v-model="state.neutralColor"
                :colors="neutralColors"
              />
            </UFormField>
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="saving"
              class="px-4"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </UPageCard>

      <UPageCard
        title="Links"
        description="Shown on the main page and in the footer."
        variant="subtle"
        :ui="{
          wrapper: 'flex-row items-center justify-between gap-4',
          footer: 'pt-0 mt-0',
        }"
      >
        <template #footer>
          <LinkModal @save="saveLink">
            <UButton
              color="primary"
              variant="subtle"
              icon="i-lucide-plus"
            >
              Add Link
            </UButton>
          </LinkModal>
        </template>

        <div
          class="overflow-x-auto"
          @dragover="dragOver"
          @drop="drop"
        >
          <UTable
            :data="settings.links"
            :columns="columns"
            :meta="{ class: { tr: rowClass } }"
          >
            <template #drag-cell="{ row }">
              <UButton
                as="span"
                :data-link-id="row.original.id"
                icon="i-lucide-grip-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                role="button"
                tabindex="0"
                aria-label="Reorder link"
                class="cursor-grab active:cursor-grabbing"
                draggable="true"
                @dragstart="dragStart($event, row.original.id)"
                @dragend="dragEnd"
                @keydown.up.prevent="shiftLink(row.original.id, -1)"
                @keydown.down.prevent="shiftLink(row.original.id, 1)"
              />
            </template>

            <template #icon-cell="{ row }">
              <UIcon
                :name="row.original.icon"
                class="size-5"
              />
            </template>

            <template #to-cell="{ row }">
              <ULink
                class="hover:underline"
                :to="row.original.to"
                target="_blank"
                external
              >
                {{ row.original.to }}
              </ULink>
            </template>

            <template #actions-cell="{ row }">
              <UFieldGroup>
                <LinkModal
                  :link="row.original"
                  @save="saveLink"
                >
                  <UButton
                    icon="i-lucide-pencil"
                    color="neutral"
                    variant="soft"
                    size="sm"
                  >
                    Edit
                  </UButton>
                </LinkModal>

                <UModal
                  title="Are you sure?"
                  :ui="{ footer: 'justify-end' }"
                >
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="soft"
                    size="sm"
                  >
                    Delete
                  </UButton>

                  <template #body>
                    Do you really want to delete the link to "{{
                      row.original.to
                    }}"? This action cannot be undone.
                  </template>

                  <template #footer="{ close }">
                    <UFieldGroup>
                      <UButton
                        label="Delete"
                        color="error"
                        variant="soft"
                        @click="() => deleteLink(row.original, close)"
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
          </UTable>
        </div>
      </UPageCard>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent, TableColumn, TableRow } from "@nuxt/ui";
import type { SettingsLink } from "~~/server/utils/settings";
import { editSettings } from "~~/shared/utils/abilities";
import {
  neutralColors,
  neutralColorValidator,
  primaryColors,
  primaryColorValidator,
} from "~~/shared/utils/theme";

useSeoMeta({
  title: "Manage Settings",
  ogTitle: "Manage Settings",
  description: "Manage photo gallery settings",
  ogDescription: "Manage photo gallery settings",
});

await authorize(editSettings);
const toast = useToast();
const settings = useSettings();
const saving = ref(false);

const schema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(32, "Cannot be longer than 32 characters"),
  header: z
    .string("A header is required")
    .min(2, "Must be at least 2 characters")
    .max(64, "Cannot be longer than 64 characters"),
  description: z
    .string("A description is required")
    .min(2, "Must be at least 2 characters")
    .max(512, "Cannot be longer than 512 characters"),
  primaryColor: primaryColorValidator(),
  neutralColor: neutralColorValidator(),
});

type SchemaIn = z.input<typeof schema>;
type SchemaOut = z.output<typeof schema>;

const state = reactive<Partial<SchemaIn>>({
  title: settings.value.title,
  header: settings.value.header,
  description: settings.value.description,
  primaryColor: settings.value.primaryColor,
  neutralColor: settings.value.neutralColor,
});

const savedColors = reactive({
  primaryColor: settings.value.primaryColor,
  neutralColor: settings.value.neutralColor,
});

watch(
  () => state.primaryColor,
  (color) => {
    if (color) settings.value.primaryColor = color;
  },
);

watch(
  () => state.neutralColor,
  (color) => {
    if (color) settings.value.neutralColor = color;
  },
);

onBeforeRouteLeave(() => {
  settings.value.primaryColor = savedColors.primaryColor;
  settings.value.neutralColor = savedColors.neutralColor;
});

const saveSettings = async (event: FormSubmitEvent<SchemaOut>) => {
  saving.value = true;

  try {
    settings.value = await useRequestFetch()("/api/settings", {
      method: "PATCH",
      body: event.data,
    });
  } finally {
    saving.value = false;
  }

  savedColors.primaryColor = settings.value.primaryColor;
  savedColors.neutralColor = settings.value.neutralColor;

  toast.add({
    title: "Settings updated",
    description: "The gallery settings have been saved.",
    icon: "i-lucide-settings",
    color: "success",
  });
};

const columns: TableColumn<SettingsLink>[] = [
  {
    id: "drag",
    header: "",
  },
  {
    accessorKey: "icon",
    header: "Icon",
  },
  {
    accessorKey: "label",
    header: "Label",
  },
  {
    accessorKey: "to",
    header: "Destination",
  },
  {
    id: "actions",
    header: "Actions",
  },
];

const sortLinks = (links: SettingsLink[]) =>
  [...links].sort((a, b) => a.ordering - b.ordering);

const saveLink = (savedLink: SettingsLink) => {
  const others = settings.value.links.filter(
    (link) => link.id !== savedLink.id,
  );

  settings.value.links = sortLinks([...others, savedLink]);
};

const draggedId = ref<string | null>(null);
const dropTargetId = ref<string | null>(null);

const rowClass = (row: TableRow<SettingsLink>) => {
  if (row.original.id === draggedId.value) return "opacity-50";
  if (row.original.id === dropTargetId.value) return "bg-elevated";

  return "";
};

const linkIdFromEvent = (event: DragEvent) => {
  const row = (event.target as Element | null)?.closest?.("tr");
  const handle = row?.querySelector<HTMLElement>("[data-link-id]");

  return handle?.dataset.linkId ?? null;
};

const dragStart = (event: DragEvent, id: string) => {
  draggedId.value = id;
  if (!event.dataTransfer) return;

  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", id);

  const row = (event.target as Element).closest("tr");
  if (row) event.dataTransfer.setDragImage(row, 0, 0);
};

const dragEnd = () => {
  draggedId.value = null;
  dropTargetId.value = null;
};

const dragOver = (event: DragEvent) => {
  if (!draggedId.value) return;

  event.preventDefault();
  dropTargetId.value = linkIdFromEvent(event);
};

const drop = (event: DragEvent) => {
  event.preventDefault();

  const id = draggedId.value;
  const targetId = linkIdFromEvent(event);
  dragEnd();

  if (!id || !targetId) return;
  return moveLink(id, targetId);
};

const moveLink = async (id: string, targetId: string) => {
  const links = [...settings.value.links];
  const from = links.findIndex((link) => link.id === id);
  const to = links.findIndex((link) => link.id === targetId);
  if (from === -1 || to === -1 || from === to) return;

  const [moved] = links.splice(from, 1);
  if (!moved) return;
  links.splice(to, 0, moved);

  const previous = settings.value.links;
  settings.value.links = links;

  try {
    settings.value.links = await useRequestFetch()("/api/links", {
      method: "PATCH",
      body: { ids: links.map((link) => link.id) },
    });
  } catch (error) {
    settings.value.links = previous;
    throw error;
  }
};

const shiftLink = (id: string, offset: number) => {
  const links = settings.value.links;
  const from = links.findIndex((link) => link.id === id);
  const target = from === -1 ? undefined : links[from + offset];

  if (!target) return;
  return moveLink(id, target.id);
};

const deleteLink = async (link: SettingsLink, close: () => void) => {
  await useRequestFetch()(`/api/links/${link.id}`, {
    method: "DELETE",
  });
  close();

  settings.value.links = settings.value.links.filter(
    (row) => row.id !== link.id,
  );
  toast.add({
    title: "Link deleted",
    description: `The link to "${link.to}" has been deleted.`,
    icon: "i-lucide-link",
    color: "error",
  });
};
</script>
