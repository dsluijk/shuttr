<template>
  <div>
    <UPageHeader
      title="Albums"
      description="Manage your albums or upload new ones."
      icon="i-lucide-albums"
    >
      <template #links>
        <AlbumCreateModal />
      </template>
    </UPageHeader>

    <UPageBody>
      <UPageCard variant="subtle">
        <UTable
          :data="albums"
          :columns="columns"
          :loading="status === 'pending'"
        />
      </UPageCard>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import { createAlbum } from "~~/shared/utils/abilities";

await authorize(createAlbum);

const { data: albums, status } = await useFetch("/api/albums");

const UBadge = resolveComponent("UBadge");
const UTooltip = resolveComponent("UTooltip");
const NuxtTime = resolveComponent("NuxtTime");
const columns: TableColumn<typeof albums>[] = computed(() => [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "sharingAllowed",
    header: "Sharing Allowed",
    cell: ({ row }) => {
      const props = {
        true: {
          color: "success",
          icon: "i-lucide-check",
        } as const,
        false: {
          color: "error",
          icon: "i-lucide-x",
        } as const,
      }[row.getValue("sharingAllowed") as string];

      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", ...props },
        () => (row.getValue("sharingAllowed") ? "Yes" : "No")
      );
    },
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => {
      const color = {
        public: "info" as const,
        authenticated: "warning" as const,
        private: "error" as const,
      }[row.getValue("visibility") as string];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("visibility")
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      h(
        UTooltip,
        {
          text: row.getValue("createdAt"),
          delayDuration: 0,
          class: "size-4 mr-2",
        },
        () =>
          h(
            NuxtTime,
            { relative: true, datetime: row.getValue("createdAt") },
            undefined
          )
      ),
  },
]);
</script>
