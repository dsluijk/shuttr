<template>
  <UDropdownMenu
    size="md"
    :items="items"
    :content="{
      align: 'end',
      side: 'bottom',
      sideOffset: 8,
    }"
    :ui="{
      content: 'w-48',
    }"
  >
    <UButton
      color="primary"
      variant="soft"
      class="data-[state=open]:bg-elevated"
      trailingIcon="i-lucide-chevron-down"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
      :label="user?.name"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { User } from "#auth-utils";

import { listUsers } from "~~/shared/utils/abilities";

const props = defineProps<{
  user: User;
  clear: () => void;
}>();

const toast = useToast();

const logout = async () => {
  await props.clear();
  toast.add({
    title: "Logged Out",
    description: "You have successfully been logged out.",
    color: "success",
    icon: "i-lucide-power-off",
  });
};

const { data: canListUser } = await useAsyncData("perms:listUsers", () =>
  allows(listUsers)
);

const items = computed<DropdownMenuItem[][]>(() =>
  [
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
        show: canListUser,
      },
      {
        label: "Settings",
        icon: "i-lucide-settings",
        to: "/admin/settings",
      },
    ],
    [
      {
        label: "Favorites",
        icon: "i-lucide-heart",
        to: "/favorites",
      },
      {
        label: "Log out",
        icon: "i-lucide-log-out",
        onClick: logout,
      },
    ],
  ]
    .map((part) =>
      part.filter((row) => row.show === undefined || row.show.value)
    )
    .filter((part) => part.length > 0)
);
</script>
