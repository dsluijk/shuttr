<template>
  <UPage>
    <template
      v-if="items.length > 1"
      #left
    >
      <UPageAside>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          color="primary"
          size="lg"
        />
      </UPageAside>
    </template>

    <NuxtPage />
  </UPage>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { listUsers, editAlbums, editLabels } from "~~/shared/utils/abilities";

const canListUsers = await allows(listUsers);
const canEditAlbums = await allows(editAlbums);
const canEditLabels = await allows(editLabels);

const items = computed<NavigationMenuItem[]>(() =>
  [
    {
      label: "Albums",
      icon: "i-lucide-folders",
      to: "/manage/albums",
      show: canEditAlbums,
    },
    {
      label: "Labels",
      icon: "i-lucide-tags",
      to: "/manage/labels",
      show: canEditLabels,
    },
    {
      label: "Users",
      icon: "i-lucide-users",
      to: "/manage/users",
      show: canListUsers,
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: "/manage/settings",
    },
  ].filter((row) => row.show === undefined || row.show),
);
</script>
