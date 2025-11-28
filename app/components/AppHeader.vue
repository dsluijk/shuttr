<template>
  <UHeader
    :title="config.title"
    :toggle="false"
  >
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
const config = useRuntimeConfig().public;
</script>
