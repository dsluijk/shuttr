<template>
  <UPage>
    <template #left>
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
import { listUsers } from "~~/shared/utils/abilities";

const canListUsers = await allows(listUsers);

const items = computed<DropdownMenuItem[][]>(() =>
  [
    {
      label: "Albums",
      icon: "i-lucide-folders",
      to: "/admin",
      exact: true,
    },
    {
      label: "Users",
      icon: "i-lucide-users",
      to: "/admin/users",
      show: canListUsers,
    },
    {
      label: "Settings",
      icon: "i-lucide-settings",
      to: "/admin/settings",
    },
  ].filter((row) => row.show === undefined || row.show)
);
</script>
