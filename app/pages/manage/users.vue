<template>
  <div>
    <UPageHeader
      title="Users"
      description="View and manage all registered users."
      icon="i-lucide-users"
    />

    <UPageBody v-if="data !== undefined && providerData !== undefined">
      <UPageCard
        variant="subtle"
        class="overflow-x-auto"
      >
        <UTable
          :data="data"
          :columns="columns"
          :loading="status === 'pending'"
        >
          <template #role-cell="{ row }">
            <UBadge
              v-bind="roleProps[row.getValue('role') as keyof typeof roleProps]"
              class="capitalize"
              variant="subtle"
            >
              {{ row.getValue("role") }}
            </UBadge>
          </template>

          <template #providers-cell="{ row }">
            <UTooltip
              v-for="provider of mapProviders(row)"
              :key="provider.id"
              :text="provider.providerData?.displayName"
              :delayDuration="0"
              class="size-4 mr-2"
            >
              <UIcon
                :name="`i-simple-icons-${
                  providerData[
                    provider['provider'] as keyof typeof providerData
                  ].icon
                }`"
              />
            </UTooltip>
          </template>
        </UTable>
      </UPageCard>
    </UPageBody>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableRow } from "@nuxt/ui";

import { listUsers } from "~~/shared/utils/abilities";

useSeoMeta({
  title: "Manage Users",
  ogTitle: "Manage Users",
  description: "Manage photo gallery users",
  ogDescription: "Manage photo gallery users",
});

await authorize(listUsers);

const { data, status } = await useFetch("/api/users");
const { data: providerData } = await useFetch("/api/auth");
type UserData = NonNullable<typeof data.value>[number];

const roleProps = {
  user: { color: "info" } as const,
  publisher: { color: "warning" } as const,
  admin: { color: "error" } as const,
} as const;

const columns: TableColumn<UserData>[] = [
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
  },
  {
    accessorKey: "providers",
    header: "Providers",
  },
];

const mapProviders = (row: TableRow<UserData>) => {
  const providers = row.getValue("providers") as UserData["providers"];
  return providers
    .map((provider) => ({
      ...provider,
      providerData: providerData.value && providerData.value[provider.provider],
    }))
    .filter((provider) => provider.providerData?.active);
};
</script>
