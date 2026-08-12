import { ref } from "#imports";

import type { Ref } from "#imports";
import type { TableRow } from "@nuxt/ui";

export const useDragOrder = <T extends { id: string }>(
  items: Ref<T[]>,
  persist: (ids: string[]) => Promise<T[]>,
) => {
  const draggedId = ref<string | null>(null);
  const dropTargetId = ref<string | null>(null);

  const rowClass = (row: TableRow<T>) => {
    if (row.original.id === draggedId.value) return "opacity-50";
    if (row.original.id === dropTargetId.value) return "bg-elevated";

    return "";
  };

  const idFromEvent = (event: DragEvent) => {
    const row = (event.target as Element | null)?.closest?.("tr");
    const handle = row?.querySelector<HTMLElement>("[data-drag-id]");

    return handle?.dataset.dragId ?? null;
  };

  const dragStart = (event: DragEvent, id: string) => {
    draggedId.value = id;
    if (!event.dataTransfer) return;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);

    const row = (event.target as Element).closest("tr");
    if (row) event.dataTransfer.setDragImage(row, 0, 0);
  };

  const dragEnd = () => {
    draggedId.value = null;
    dropTargetId.value = null;
  };

  const dragOver = (event: DragEvent) => {
    if (!draggedId.value) return;

    event.preventDefault();
    dropTargetId.value = idFromEvent(event);
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();

    const id = draggedId.value;
    const targetId = idFromEvent(event);
    dragEnd();

    if (!id || !targetId) return;
    return move(id, targetId);
  };

  const move = async (id: string, targetId: string) => {
    const reordered = [...items.value];
    const from = reordered.findIndex((item) => item.id === id);
    const to = reordered.findIndex((item) => item.id === targetId);
    if (from === -1 || to === -1 || from === to) return;

    const [moved] = reordered.splice(from, 1);
    if (!moved) return;
    reordered.splice(to, 0, moved);

    const previous = items.value;
    items.value = reordered;

    try {
      items.value = await persist(reordered.map((item) => item.id));
    } catch (error) {
      items.value = previous;
      throw error;
    }
  };

  return { rowClass, dragStart, dragEnd, dragOver, drop };
};
