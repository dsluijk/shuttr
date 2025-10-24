<template>
  <UModal v-model:open="open">
    <UButton label="Sign in" color="neutral" variant="outline" />

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
import type { ButtonProps } from "@nuxt/ui";

const { loggedIn, session, fetch, clear, openInPopup } = useUserSession();
const open = ref(false);

const providers = ref<ButtonProps[]>([
  {
    label: "Development",
    icon: "i-simple-icons-openid",
    to: "/auth/develop",
    external: true,
  },
]);

import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();
</script>
