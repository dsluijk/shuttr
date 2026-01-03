import z from "zod";
import { hex as hexContrast } from "wcag-contrast";

export const colorValidator = () =>
  z.string().regex(/^#[0-9a-fA-F]{6}$/, {
    message:
      "Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).",
  });

export const readableColorValidator = () =>
  colorValidator().refine((color) => {
    const lightBackground = "#fff";
    const darkBackground = "#171717";
    const minContrast = 2;

    if (hexContrast(color, lightBackground) < minContrast) return false;
    if (hexContrast(color, darkBackground) < minContrast) return false;

    return true;
  }, "The color must be readable (WCAG score > 2.0)");
