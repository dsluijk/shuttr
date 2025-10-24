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
const items = ref([
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
  },
  {
    label: "Settings",
    icon: "i-lucide-settings",
    to: "/admin/settings",
  },
]);
</script>
