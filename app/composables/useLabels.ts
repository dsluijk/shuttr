import { useFetch, useRequestFetch } from "#imports";

import type { label } from "~~/server/database/schema/label";

export type LabelModel = typeof label.$inferSelect;

export const useLabels = async () => {
  const requestFetch = useRequestFetch();

  const { data: labels, pending: loading } = await useFetch<LabelModel[]>(
    "/api/labels",
    { key: "labels", deep: true, default: () => [] },
  );

  const create = async (title: string) => {
    const created = await requestFetch<LabelModel | undefined>("/api/labels", {
      method: "POST",
      body: { title, style: "solid" },
    });

    if (!created) return;
    labels.value.push(created);

    return created;
  };

  return { labels, loading, create };
};
