import z from "zod";

export const neutralColors = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "mauve",
  "olive",
  "mist",
  "taupe",
] as const;

export const primaryColors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type NeutralColor = (typeof neutralColors)[number];
export type PrimaryColor = (typeof primaryColors)[number];
export type ThemeColor = NeutralColor | PrimaryColor;

export const neutralColorValidator = () => z.literal(neutralColors);
export const primaryColorValidator = () => z.literal(primaryColors);

export const defaultSettings = {
  title: "Shuttr",
  header: "Shuttr Photo Gallery",
  description:
    "Shuttr is a simple to use self-hosted photo gallery for amateurs.",
  primaryColor: "blue",
  neutralColor: "neutral",
  logoLight: null,
  logoDark: null,
  cover: null,
} satisfies {
  title: string;
  header: string;
  description: string;
  primaryColor: PrimaryColor;
  neutralColor: NeutralColor;
  logoLight: string | null;
  logoDark: string | null;
  cover: string | null;
};
