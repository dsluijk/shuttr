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
        v-for="(link, index) of socials"
        :key="index"
        v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
      />
      <ColorModeButton />
    </template>
  </UFooter>
</template>
