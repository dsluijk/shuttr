<template>
  <div>
    <UPageHeader
      title="Users"
      description="View and manage all registered users."
      icon="i-lucide-users"
    />

    <UPageBody>
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
              v-bind="roleProps[row.getValue('role')]"
              class="capitalize"
              variant="subtle"
            >
              {{ row.getValue("role") }}
            </UBadge>
          </template>

          <template #providers-cell="{ row }">
            <UTooltip
              v-for="(provider, _index) of row
                .getValue('providers')
                .filter(
                  (provider) => providerData[provider['provider']].active,
                )"
              :key="provider.id"
              :text="providerData[provider['provider']].displayName"
              :delayDuration="0"
              class="size-4 mr-2"
            >
              <UIcon
                :name="`i-simple-icons-${
                  providerData[provider['provider']].icon
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
import type { TableColumn } from "@nuxt/ui";

import { listUsers } from "~~/shared/utils/abilities";

await authorize(listUsers);

const { data, status } = await useFetch("/api/users");
const { data: providerData } = await useFetch("/api/auth");

const roleProps = ref({
  user: { color: "info" } as const,
  publisher: { color: "warning" } as const,
  admin: { color: "error" } as const,
});

const columns: TableColumn<typeof data>[] = computed(() => [
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
]);
</script>
