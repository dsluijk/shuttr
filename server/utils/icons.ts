import * as z from "zod";
import { icons as lucideIcons } from "@iconify-json/lucide";
import { icons as simpleIcons } from "@iconify-json/simple-icons";

export const iconCollections = ["lucide", "simple-icons"] as const;
export type IconCollection = (typeof iconCollections)[number];

export type IconOption = {
  name: string;
  icon: string;
};

const sets: Record<IconCollection, { icons: Record<string, unknown> }> = {
  lucide: lucideIcons,
  "simple-icons": simpleIcons,
};

const capitalizeWords = (input: string): string => {
  return input
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const cache = new Map<IconCollection, IconOption[]>();

export const listIcons = (collections: IconCollection[]): IconOption[] =>
  collections.flatMap((collection) => {
    const cached = cache.get(collection);
    if (cached) return cached;

    const options = Object.keys(sets[collection].icons).map((icon) => ({
      name: capitalizeWords(icon.replaceAll("-", " ")),
      icon: `i-${collection}-${icon}`,
    }));

    cache.set(collection, options);
    return options;
  });

export const iconValidator = (
  collections: IconCollection[] = [...iconCollections],
) => z.literal(listIcons(collections).map((option) => option.icon));
