import { z } from 'zod';

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, 'Restaurant name is required')
    .max(100, 'Restaurant name must be 100 characters or less'),

  category: z
    .string()
    .min(1, 'Category type is required')
    .max(50, 'Category must be 50 characters or less'),

  rating: z
    .number({
      required_error: 'Rating is required',
      invalid_type_error: 'Rating must be a number',
    })
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
});

export type RestaurantSchemaType = z.infer<typeof restaurantSchema>;
