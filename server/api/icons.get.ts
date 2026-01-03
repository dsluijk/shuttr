import { icons } from "@iconify-json/lucide";

const capitalizeWords = (input: string): string => {
  return input
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export default defineEventHandler(async () => {
  const iconNames = Object.keys(icons.icons);
  return iconNames.map((icon) => ({
    name: capitalizeWords(icon.replaceAll("-", " ")),
    icon: `i-lucide-${icon}`,
  }));
});
