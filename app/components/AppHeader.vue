<template>
  <UHeader title="Shuttr" :toggle="false">
    <template #right>
      <AuthState v-slot="{ loggedIn, user, clear }">
        <ProfileDropdown v-if="loggedIn" :user :clear />
        <LoginModal v-else />
      </AuthState>
    </template>
  </UHeader>
</template>
