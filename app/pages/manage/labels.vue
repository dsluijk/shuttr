<template>
  <div>
    <UPageHeader
      title="Labels"
      description="Manage the album labels."
      icon="i-lucide-tags"
    >
      <template #links>
        <LabelCreateModal @create="newLabel" />
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageCard
        variant="subtle"
        class="overflow-x-auto"
        :ui="{
          container: 'p-0 sm:p-0',
        }"
      >
        <div
          class="min-w-0"
          @dragover="dragOver"
          @drop="drop"
        >
          <UTable
            v-model:columnVisibility="columnVisibility"
            :data="orderedLabels"
            :columns="columns"
            :loading="status === 'pending'"
            :meta="{ class: { tr: rowClass } }"
          >
            <template #drag-cell="{ row }">
              <UButton
                as="span"
                :data-drag-id="row.original.id"
                icon="i-lucide-grip-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                role="button"
                tabindex="0"
                aria-label="Reorder label"
                class="cursor-grab active:cursor-grabbing"
                draggable="true"
                @dragstart="dragStart($event, row.original.id)"
                @dragend="dragEnd"
              />
            </template>

            <template #title-cell="{ row }">
              <Label
                size="md"
                :model="row.original"
              >
                {{ row.getValue("title") }}
              </Label>
            </template>

            <template #actions-cell="{ row }">
              <UFieldGroup>
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  disabled
                >
                  Edit
                </UButton>

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
                    Do you really want to delete the label "{{
                      row.getValue("title")
                    }}"? This action cannot be undone.
                  </template>

                  <template #footer="{ close }">
                    <UFieldGroup>
                      <UButton
                        label="Delete"
                        color="error"
                        variant="soft"
                        @click="() => deleteLabel(row, close)"
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
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { label } from "~~/server/database/schema/label";
import { editLabels } from "~~/shared/utils/abilities";

useSeoMeta({
  title: "Manage Labels",
  ogTitle: "Manage Labels",
  description: "Manage photo gallery labels",
  ogDescription: "Manage photo gallery labels",
});

await authorize(editLabels);
const toast = useToast();

const { data: labels, status } = await useFetch("/api/labels", { deep: true });
type LabelData = NonNullable<typeof labels.value>[number];

const orderedLabels = computed({
  get: () => labels.value ?? [],
  set: (value) => {
    labels.value = value;
  },
});

const { rowClass, dragStart, dragEnd, dragOver, drop } = useDragOrder(
  orderedLabels,
  (ids) =>
    useRequestFetch()("/api/labels", {
      method: "PATCH",
      body: { ids },
    }),
);

const columnVisibility = ref({
  id: false,
  style: false,
});

const columns: TableColumn<LabelData>[] = [
  {
    id: "drag",
    header: "",
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Title",
    meta: {
      class: {
        th: "w-full",
        td: "w-full",
      },
    },
  },
  {
    accessorKey: "style",
    header: "Style",
  },
  {
    id: "actions",
    header: "Actions",
  },
];

const newLabel = (createdLabel: typeof label.$inferSelect) => {
  if (!labels.value) return;

  labels.value.push(createdLabel);
};

const deleteLabel = async (row: TableRow<LabelData>, close: () => void) => {
  if (!labels.value) return;

  const id = row.getValue("id");
  await useRequestFetch()(`/api/labels/${id}`, {
    method: "DELETE",
  });
  close();

  labels.value = labels.value.filter((label) => label.id !== id);
  toast.add({
    title: "Label deleted",
    description: `The label "${row.getValue("title")}" has been deleted.`,
    icon: "i-lucide-tag",
    color: "error",
  });
};
</script>
