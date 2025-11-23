import * as z from "zod";
import { type DateRange } from "reka-ui";

export const dateRangeValidator = (requirePast: boolean = false) => {
  let startValidator = z.date("A valid date is required.");
  let endValidator = z.date();

  if (requirePast) {
    const now = new Date();
    startValidator = startValidator.max(
      now,
      "The start date of the album can't be in the future.",
    );
    endValidator = endValidator.max(
      now,
      "The end date of the album can't be in the future.",
    );
  }

  const schema = z
    .object({
      start: startValidator,
      end: endValidator,
    })
    .refine(({ start, end }) => start <= end, {
      error: "Start should not be before end.",
    });

  return z.preprocess(
    (range: DateRange | undefined) => ({
      start: range?.start?.toDate("UTC"),
      end: (range?.end ?? range?.start)?.toDate("UTC"),
    }),
    z
      .looseObject<z.output<typeof schema>>({} as any)
      .superRefine((val, ctx) => {
        const result = schema.safeParse(val);

        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              ...issue,
              path: [],
            });
          }
        }
      }),
  );
};
