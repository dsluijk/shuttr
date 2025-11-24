<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="soft"
      size="lg"
      icon="i-lucide-calendar"
      class="w-full"
      :ui="{
        base: 'text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
      }"
    >
      <template v-if="model && model.start">
        {{ df.format(model.start.toDate(getLocalTimeZone())) }}

        <template v-if="model.end && model.start.compare(model.end) !== 0">
          &nbsp;-&nbsp;
          {{ df.format(model.end.toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>Pick a date</template>
    </UButton>

    <template #content>
      <UCalendar
        v-model="model"
        class="p-2"
        :maxValue
        range
      />
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import type { DateValue } from "@internationalized/date";
import type { DateRange } from "reka-ui";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";

defineProps<{
  maxValue: DateValue | undefined;
}>();

const model = defineModel<DateRange>();

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});
</script>
