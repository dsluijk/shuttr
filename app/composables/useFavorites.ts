import {
  computed,
  useAsyncData,
  useRequestFetch,
  useToast,
  useUserSession,
} from "#imports";

export const useFavorites = () => {
  const toast = useToast();
  const requestFetch = useRequestFetch();
  const { loggedIn } = useUserSession();

  const { data: ids } = useAsyncData<string[]>(
    "favorites",
    async () =>
      loggedIn.value ? await requestFetch("/api/favorites/ids") : [],
    {
      default: () => [] as string[],
      watch: [loggedIn],
    },
  );

  const favorited = computed(() => new Set(ids.value));
  const isFavorite = (photoId: string) => favorited.value.has(photoId);

  const toggle = async (photoId: string) => {
    if (!loggedIn.value) return;

    const wasFavorite = isFavorite(photoId);
    const previous = ids.value;

    ids.value = wasFavorite
      ? ids.value.filter((id: string) => id !== photoId)
      : [...ids.value, photoId];

    try {
      await requestFetch(`/api/favorites/${photoId}`, {
        method: wasFavorite ? "DELETE" : "PUT",
      });
    } catch {
      ids.value = previous;

      toast.add({
        title: wasFavorite ? "Failed to Unfavorite" : "Failed to Favorite",
        description: "Something went wrong, please try again.",
        icon: "i-lucide-heart-crack",
        color: "error",
      });
    }
  };

  return { ids, isFavorite, toggle };
};
