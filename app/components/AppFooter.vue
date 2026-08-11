<template>
  <UFooter>
    <template #left>
      <span>
        <ULink
          class="hover:underline"
          to="https://github.com/dsluijk/shuttr"
          target="_blank"
          external
        >
          Shuttr
        </ULink>
        © {{ new Date().getFullYear() }} • Build by
        <ULink
          class="hover:underline"
          to="https://dany.dev"
          target="_blank"
          external
        >
          Dany Sluijk
        </ULink>
      </span>
    </template>

    <template #right>
      <UButton
        v-for="link of settings.links"
        :key="link.id"
        size="xs"
        color="neutral"
        variant="ghost"
        target="_blank"
        :icon="link.icon"
        :to="link.to"
        :label="link.label ?? undefined"
      />
      <ColorModeButton />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
const settings = useSettings();
</script>
