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
        :ui="{
          container: 'p-0 sm:p-0 gap-y-0',
        }"
      >
        <div
          class="flex flex-wrap flex-col md:flex-row items-center justify-between gap-1.5 w-full m-auto px-4 py-3.5"
        >
          <div class="flex-1 w-full">
            <UInput
              v-model="searchQuery.search"
              variant="soft"
              icon="i-lucide-search"
              placeholder="Search.."
              class="w-full"
            />
          </div>

          <div class="flex w-full md:w-auto flex-wrap items-center">
            <USelectMenu
              v-model="searchQuery.labels"
              :items="labels"
              :loading="labelsLoading"
              valueKey="id"
              labelKey="title"
              placeholder="Select labels.."
              variant="soft"
              size="md"
              class="w-full md:w-48 overflow-hidden"
              multiple
            >
              <template #default="{ modelValue }">
                <UBadge
                  v-for="(label, index) of mapLabelIds(modelValue ?? [])"
                  :key="index"
                  size="sm"
                  :variant="label?.style"
                  class="truncate max-w-24"
                >
                  {{ label?.title ?? "Unknown" }}
                </UBadge>
              </template>

              <template #item-label="{ item: label }">
                <UBadge :variant="label.style">{{ label.title }}</UBadge>
              </template>
            </USelectMenu>
          </div>
        </div>

        <div class="overflow-x-auto grid">
          <UTable
            v-model:columnVisibility="columnVisibility"
            ref="table"
            :data="albums"
            :columns="columns"
            :loading="isLoading"
            class="max-h-[60vh] h-full overflow-y-auto"
            sticky
          >
            <template #title-cell="{ row }">
              <ULink :to="`/${row.getValue('slug')}`">
                {{ row.getValue("title") }}
              </ULink>
            </template>

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

            <template #dates-cell="{ row }">
              <NuxtTime
                :datetime="row.getValue('startDate')"
                year="numeric"
                month="short"
                day="numeric"
              />
              <span
                v-if="row.getValue('startDate') !== row.getValue('endDate')"
              >
                &nbsp;-&nbsp;
              </span>
              <NuxtTime
                v-if="row.getValue('startDate') !== row.getValue('endDate')"
                :datetime="row.getValue('endDate')"
                year="numeric"
                month="short"
                day="numeric"
              />
            </template>

            <template #actions-cell="{ row }">
              <UFieldGroup>
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="soft"
                  size="sm"
                  :to="`/manage/albums/${row.getValue('slug')}`"
                />

                <UModal
                  title="Are you sure?"
                  :ui="{ footer: 'justify-end' }"
                >
                  <UButton
                    icon="i-lucide-trash"
                    color="error"
                    variant="soft"
                    size="sm"
                  />

                  <template #body>
                    Do you really want to delete the album "{{
                      row.getValue("title")
                    }}" with it's photos? This action cannot be undone.
                  </template>

                  <template #footer="{ close }">
                    <UFieldGroup>
                      <UButton
                        label="Delete"
                        color="error"
                        variant="soft"
                        @click="() => deleteAlbum(row, close)"
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
import { editAlbums } from "~~/shared/utils/abilities";

useSeoMeta({
  title: "Manage Albums",
  ogTitle: "Manage Albums",
  description: "Manage photo gallery albums",
  ogDescription: "Manage photo gallery albums",
});

await authorize(editAlbums);

const toast = useToast();

const table = useTemplateRef("table");
const { data: labels, pending: labelsLoading } = await useFetch("/api/labels");
const mapLabelIds = (labelIds: string[]) =>
  labelIds.map((labelId) =>
    labels.value?.find((label) => label.id === labelId),
  );

const searchQuery = reactive({
  search: "",
  labels: [] as string[],
});

const albums = useState<
  Awaited<ReturnType<typeof $fetch<unknown, "/api/albums">>>
>(() => []);
const hasMore = useState(() => true);
const isLoading = useState(() => false);

const fetchNextAlbums = async () => {
  isLoading.value = true;
  const newAlbums = await useRequestFetch()("/api/albums", {
    query: { ...searchQuery, offset: albums.value.length, limit: 20 },
  });
  isLoading.value = false;

  if (newAlbums.length < 20) {
    hasMore.value = false;
  }

  albums.value.push(...newAlbums);
};

const { reset: resetAlbums } = useInfiniteScroll(
  table as any,
  fetchNextAlbums,
  {
    canLoadMore: () => hasMore.value && !isLoading.value,
  },
);

watch(searchQuery, () => {
  albums.value = [];
  hasMore.value = true;
  resetAlbums();
});

await callOnce(async () => fetchNextAlbums());

type AlbumData = NonNullable<typeof albums.value>[number];

const sharingProps = {
  true: { color: "success", icon: "i-lucide-check" } as const,
  false: { color: "error", icon: "i-lucide-trash" } as const,
} as const;

const visibilityProps = {
  public: { color: "info" } as const,
  authenticated: { color: "warning" } as const,
  private: { color: "error" } as const,
} as const;

const columnVisibility = ref({
  slug: false,
  startDate: false,
  endDate: false,
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
    accessorKey: "dates",
    header: "Date",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    id: "actions",
  },
];

const deleteAlbum = async (row: TableRow<AlbumData>, close: () => void) => {
  if (!albums.value) return;

  const slug = row.getValue("slug");
  const { deletedPhotos } = await useRequestFetch()(`/api/albums/${slug}`, {
    method: "DELETE",
  });

  close();

  albums.value = albums.value.filter((album) => album.slug !== slug);
  toast.add({
    title: "Album deleted",
    description: `The album "${row.getValue("title")}" with ${deletedPhotos} photos has been deleted.`,
    icon: "i-lucide-trash",
    color: "error",
  });
};
</script>
