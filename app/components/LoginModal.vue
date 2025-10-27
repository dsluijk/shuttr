<template>
  <UButton
    label="Sign in"
    color="neutral"
    variant="outline"
    @click="quickOpen"
  />

  <UModal v-model:open="open">
    <template #content>
      <div class="p-4 sm:p-6">
        <UAuthForm
          title="Login"
          description="Enter your credentials to access Shuttr."
          icon="i-lucide-user"
          :providers="providers"
        />
        <USeparator class="py-4" />
        <UButton @click="open = false" variant="outline" color="neutral" block>
          Cancel
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = ref(false);

const { data: authData } = await useFetch("/api/auth");
const providers = computed(() =>
  Object.entries(authData.value)
    .map(([name, data]) => ({ ...data, name }))
    .filter((method) => method.active)
    .map((method) => ({
      label: method.displayName,
      icon: `i-simple-icons-${method.icon}`,
      to: `/auth/${method.name}`,
      external: true,
    }))
);

const quickOpen = async () => {
  if (providers.value.length === 1) {
    // There is only one provider, so we will start the flow immediately.
    await navigateTo(providers.value[0].to, { external: true });
  } else {
    open.value = true;
  }
};
</script>
