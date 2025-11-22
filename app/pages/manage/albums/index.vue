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
      <UPageCard
        variant="subtle"
        class="overflow-x-auto"
      >
        <UTable
          v-model:columnVisibility="columnVisibility"
          :data="albums"
          :columns="columns"
          :loading="status === 'pending'"
        >
          <template #sharingAllowed-cell="{ row }">
            <UBadge
              v-bind="
                sharingProps[
                  row.getValue('sharingAllowed') as keyof typeof sharingProps
                ]
              "
              class="capitalize"
              variant="subtle"
            >
              {{ row.getValue("sharingAllowed") ? "Yes" : "No" }}
            </UBadge>
          </template>

          <template #visibility-cell="{ row }">
            <UBadge
              v-bind="
                visibilityProps[
                  row.getValue('visibility') as keyof typeof visibilityProps
                ]
              "
              class="capitalize"
              variant="subtle"
            >
              {{ row.getValue("visibility") }}
            </UBadge>
          </template>

          <template #createdAt-cell="{ row }">
            <UTooltip
              :text="row.getValue('createdAt')"
              :delayDuration="0"
              class="size-4 mr-2"
            >
              <NuxtTime
                :datetime="row.getValue('createdAt')"
                relative
              />
            </UTooltip>
          </template>

          <template #actions-cell="{ row }">
            <UDropdownMenu
              :items="editAlbumItems(row)"
              :content="{
                align: 'end',
              }"
              :ui="{
                content: 'min-w-36',
              }"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                aria-label="Actions"
              />
            </UDropdownMenu>
          </template>
        </UTable>
      </UPageCard>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui";
import { editAlbums } from "~~/shared/utils/abilities";

useSeoMeta({
  title: "Manage Albums",
  ogTitle: "Manage Albums",
  description: "Manage photo gallery albums",
  ogDescription: "Manage photo gallery albums",
});

await authorize(editAlbums);

const toast = useToast();
const { resolve } = useRouter();
const { copy } = useClipboard();
const { origin } = useRequestURL();

const { data: albums, status } = await useFetch("/api/albums");
type AlbumData = NonNullable<typeof albums.value>[number];

const sharingProps = {
  true: { color: "success", icon: "i-lucide-check" } as const,
  false: { color: "error", icon: "i-lucide-x" } as const,
} as const;

const visibilityProps = {
  public: { color: "info" } as const,
  authenticated: { color: "warning" } as const,
  private: { color: "error" } as const,
} as const;

const columnVisibility = ref({
  slug: false,
});

const columns: TableColumn<AlbumData>[] = [
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "sharingAllowed",
    header: "Sharing Allowed",
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
  },
];

const editAlbumItems = (row: TableRow<AlbumData>) => [
  [
    {
      label: "View",
      icon: "i-lucide-eye",
      to: `/${row.getValue("slug")}`,
    },
    {
      label: "Copy Link",
      icon: "i-lucide-clipboard",
      onClick: () => copyLink(row),
    },
    {
      label: "Edit",
      icon: "i-lucide-pencil",
      to: `/manage/albums/${row.getValue("slug")}`,
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-x",
      color: "error",
      variant: "solid",
      onClick: () => deleteAlbum(row),
    },
  ],
];

const copyLink = (row: TableRow<AlbumData>) => {
  const slug = row.getValue("slug");
  copy(new URL(resolve(`/${slug}`).href, origin).href);

  toast.add({
    title: "Link Copied",
    description: "A link to the album has been copied to your clipboard.",
    icon: "i-lucide-clipboard",
  });
};

const deleteAlbum = async (row: TableRow<AlbumData>) => {
  if (!albums.value) return;

  const slug = row.getValue("slug");
  const { deletedPhotos } = await useRequestFetch()(`/api/albums/${slug}`, {
    method: "DELETE",
  });

  albums.value = albums.value.filter((album) => album.slug !== slug);
  toast.add({
    title: "Album deleted",
    description: `The album "${row.getValue("title")}" with ${deletedPhotos} photos has been deleted.`,
    icon: "i-lucide-x",
    color: "success",
  });
};
</script>
