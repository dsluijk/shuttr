<template>
  <UModal
    title="Add Label"
    description="Create a new label."
    v-model:open="modalOpen"
  >
    <UButton
      color="primary"
      variant="subtle"
      icon="i-lucide-plus"
      block
    >
      Add Label
    </UButton>

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="createLabel"
      >
        <UFormField
          label="Title"
          name="title"
          required
        >
          <UInput
            v-model="state.title"
            placeholder="Beach"
            variant="soft"
            size="lg"
            class="w-full"
            :maxlength="24"
          />
        </UFormField>

        <UFormField
          label="Style"
          name="style"
          required
        >
          <USelect
            v-model="state.style"
            :items="styleOptions"
            variant="soft"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
        >
          Submit
        </UButton>

        <USeparator label="Preview" />

        <div class="flex justify-center">
          <UBadge
            size="lg"
            :variant="state.style"
          >
            {{ state.title || "Beach" }}
          </UBadge>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { label, LabelStyle } from "~~/server/database/schema/label";

const emit = defineEmits<{
  create: [typeof label.$inferSelect];
}>();

const modalOpen = ref(false);
const toast = useToast();

const styleOptions = ref([
  { label: "Solid", value: LabelStyle.SOLID, icon: "i-lucide-globe" },
  { label: "Outline", value: LabelStyle.OUTLINE, icon: "i-lucide-users" },
  { label: "Soft", value: LabelStyle.SOFT, icon: "i-lucide-lock" },
  { label: "Subtle", value: LabelStyle.SUBTLE, icon: "i-lucide-lock" },
]);

const schema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(24, "Cannot be longer than 24 characters"),
  style: z.enum(LabelStyle),
});

type SchemaIn = z.input<typeof schema>;
type SchemaOut = z.output<typeof schema>;

const state = shallowReactive<Partial<SchemaIn>>({
  title: "",
  style: LabelStyle.SOLID,
});

const createLabel = async (event: FormSubmitEvent<SchemaOut>) => {
  const createdLabel = await useRequestFetch()("/api/labels", {
    method: "POST",
    body: event.data,
  });

  if (!createdLabel) return;

  toast.add({
    title: "Label created",
    description: `The label "${state.title}" has been created.`,
    icon: "i-lucide-tag",
    color: "success",
  });

  emit("create", createdLabel);
  modalOpen.value = false;
};
</script>
