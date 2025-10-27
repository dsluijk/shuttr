<template>
  <div>
    <UPageHeader
      title="Users"
      description="View and manage all registered users."
      icon="i-lucide-users"
    />

    <UPageBody>
      <UPageCard variant="subtle">
        <UTable
          :data="data"
          :columns="columns"
          :loading="status === 'pending'"
        />
      </UPageCard>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from "vue";
import type { TableColumn } from "@nuxt/ui";

import { listUsers } from "~~/shared/utils/abilities";

if (await denies(listUsers)) {
  await navigateTo("/admin");
}

const { data, status, error, refresh, clear } = await useFetch("/api/users");

const UBadge = resolveComponent("UBadge");
const UIcon = resolveComponent("UIcon");
const UTooltip = resolveComponent("UTooltip");

const columns: TableColumn<typeof data>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const color = {
        user: "info" as const,
        publisher: "warning" as const,
        admin: "error" as const,
      }[row.getValue("role") as string];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("role")
      );
    },
  },
  {
    accessorKey: "providers",
    header: "Providers",
    cell: ({ row }) => {
      return h(
        "span",
        row.getValue("providers").map((provider) =>
          h(
            UTooltip,
            {
              text: provider["provider"],
              delayDuration: 0,
              class: "size-4 mr-2",
            },
            () => h(UIcon, { name: "i-simple-icons-openid" }, () => [])
          )
        )
      );
    },
  },
];
</script>
