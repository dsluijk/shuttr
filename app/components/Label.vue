<template>
  <UBadge
    :size="props.size"
    :variant="props.variant"
    :icon="props.icon"
    :style="`--ui-primary: ${props.color ?? 'inherit'}`"
  >
    <slot />
  </UBadge>
</template>

<script lang="ts" setup>
const rawProps = defineProps<{
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "solid" | "outline" | "soft" | "subtle";
  icon?: string | null;
  color?: string | null;
  model?: {
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    style?: "solid" | "outline" | "soft" | "subtle";
    icon?: string | null;
    color?: string | null;
  };
}>();

const props = computed(() => ({
  size: rawProps.model?.size ?? rawProps.size,
  variant: rawProps.model?.style ?? rawProps.variant,
  icon: rawProps.model?.icon ?? rawProps.icon,
  color: rawProps.model?.color ?? rawProps.color,
}));
</script>
