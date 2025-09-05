import { z } from 'zod';

// Zod schema for validation
export const ebayListingSchema = z.object({
  title: z.string().max(80, "Title must be 80 characters or less."),
  category_suggestion: z.string().min(1, "Category suggestion is required."),
  condition: z.enum(["New", "Used", "For parts or not working"]),
  description: z.string().min(1, "Description is required."),
  item_specifics: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  price_recommendation: z.object({
    price: z.number(),
    justification: z.string(),
  }),
  shipping_recommendation: z.object({
    est_weight: z.string(),
    est_dimensions: z.string(),
    rec_service: z.string(),
  }),
});

// Infer the TypeScript type from the Zod schema
export type EBayListingData = z.infer<typeof ebayListingSchema>;

// Extend the type to include runtime-added properties like id and sources
export interface EBayListing extends EBayListingData {
  id: string;
  sources?: {
    uri: string;
    title: string;
  }[];
}
