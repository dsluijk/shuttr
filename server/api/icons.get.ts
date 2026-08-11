import * as z from "zod";

export default defineEventHandler(async (event) => {
  const { collections } = await getValidatedQuery(event, querySchema.parse);
  return listIcons(collections);
});

const querySchema = z.object({
  collections: z
    .union([z.enum(iconCollections), z.array(z.enum(iconCollections))])
    .default("lucide")
    .transform((value) => (Array.isArray(value) ? value : [value])),
});
