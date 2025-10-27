import { char } from "drizzle-orm/pg-core";
import { init } from "@paralleldrive/cuid2";

export const cuid2 = (length: number = 24) => {
  return char({ length: length }).$defaultFn(init({ length }));
};

// https://github.com/drizzle-team/drizzle-orm/discussions/1914#discussioncomment-9600199
export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}
