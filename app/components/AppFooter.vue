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
        v-for="(link, index) of config.links"
        :key="index"
        v-bind="{
          size: 'xs',
          color: 'neutral',
          variant: 'ghost',
          target: '_blank',
          ...link,
        }"
      />
      <ColorModeButton />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
const config = useRuntimeConfig().public;
</script>
