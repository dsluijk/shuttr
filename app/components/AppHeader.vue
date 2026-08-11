<template>
  <UHeader
    :title="settings.title"
    :toggle="false"
    :ui="{ left: 'min-w-0', title: 'min-w-0 shrink' }"
  >
    <template
      v-if="logo"
      #title
    >
      <UColorModeImage
        :light="logo.light"
        :dark="logo.dark"
        :alt="settings.title"
        provider="none"
        class="h-8 w-auto max-w-64 min-w-0 object-cover object-left"
      />
    </template>

    <template #right>
      <AuthState
        v-if="!isIframe"
        v-slot="{ loggedIn, user, clear }"
      >
        <ProfileDropdown
          v-if="loggedIn"
          :user
          :clear
        />
        <LoginModal v-else />
      </AuthState>
      <UButton
        v-else
        :to="$route.fullPath"
        target="_blank"
      >
        Open Gallery
      </UButton>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const isIframe = useDetectIframe();
const settings = useSettings();
const route = useRoute();

const logo = computed(() => {
  const { logoLight, logoDark } = settings.value;
  if (!logoLight && !logoDark) return null;

  let forcedTheme = null;
  if (route.query.theme === "dark") {
    forcedTheme = logoDark;
  } else if (route.query.theme === "light") {
    forcedTheme = logoLight;
  }

  return {
    light: `/logo/${forcedTheme ?? logoLight ?? logoDark}`,
    dark: `/logo/${forcedTheme ?? logoDark ?? logoLight}`,
  };
});
</script>
