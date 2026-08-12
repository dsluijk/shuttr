<template>
  <UModal
    v-model:open="modalOpen"
    title="Add Label"
    description="Create a new label."
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

        <UFormField
          label="Icon"
          name="icon"
        >
          <InputIcon v-model="state.icon" />
        </UFormField>

        <UFormField
          label="Color"
          name="color"
        >
          <InputColor v-model="state.color" />
        </UFormField>

        <UButton
          type="submit"
          block
        >
          Submit
        </UButton>

        <USeparator label="Preview" />

        <div class="flex justify-center">
          <Label
            :model="state"
            size="lg"
          >
            {{ state.title || "Beach" }}
          </Label>
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { label } from "~~/server/database/schema/label";
import { LabelStyle } from "~~/server/database/schema/label";

const emit = defineEmits<{
  create: [typeof label.$inferSelect];
}>();

const modalOpen = ref(false);
const toast = useToast();

const styleOptions = ref([
  { label: "Solid", value: LabelStyle.SOLID },
  { label: "Outline", value: LabelStyle.OUTLINE },
  { label: "Soft", value: LabelStyle.SOFT },
  { label: "Subtle", value: LabelStyle.SUBTLE },
]);

const schema = z.object({
  title: z
    .string("A title is required")
    .min(2, "Must be at least 2 characters")
    .max(24, "Cannot be longer than 24 characters"),
  style: z.enum(LabelStyle),
  icon: z.string().optional(),
  color: readableColorValidator().optional(),
});

type SchemaIn = z.input<typeof schema>;
type SchemaOut = z.output<typeof schema>;

const state = reactive<Partial<SchemaIn>>({
  title: "",
  style: LabelStyle.SOLID,
  icon: undefined,
  color: undefined,
});

watch(modalOpen, (open) => {
  if (!open) return;

  state.title = "";
  state.style = LabelStyle.SOLID;
  state.icon = undefined;
  state.color = undefined;
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
