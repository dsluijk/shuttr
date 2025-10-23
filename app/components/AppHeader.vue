<template>
  <UHeader mode="drawer" title="Shuttr">
    <template #right>
      <UButton
        label="Sign in"
        color="neutral"
        variant="outline"
        to="/login"
        class="hidden lg:inline-flex"
      />
    </template>

    <template #body>
      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
    </template>
  </UHeader>
</template>
