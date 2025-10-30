import { z } from "zod";

// Define the coupon type enum
const CouponTypeEnum = z.enum(["Product", "cart", "BxGy"], "Type must be one of: Product, cart, or BxGy" 
);

// Schema for creating a new coupon
export const newCouponSchema = z.object({
    couponCode: z.string()
        .min(1, "couponCode is required")
        .max(100, "couponCode must be less than 10 characters"),

    name: z.string()
        .min(1, "Name is required")
        .max(200, "Name must be less than 200 characters"),

    discount: z.number()
        .positive("Discount must be a positive number")
        .max(100, "Discount cannot exceed 100%"),

    Description: z.string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters"),

    BuyCategory: z.array(z.string())
        .min(1, "At least one buy category is required")
        .refine(
            (categories) => categories.every(cat => cat.trim().length > 0),
            "Category names cannot be empty"
        ),

    GetCategory: z.array(z.string())
        .min(1, "At least one get category is required")
        .refine(
            (categories) => categories.every(cat => cat.trim().length > 0),
            "Category names cannot be empty"
        ),

    type: CouponTypeEnum
});


// Schema for partial coupon updates (all fields optional)
export const updateCouponSchema = z.object({
    id: z.string().min(1).max(100).optional(),
    name: z.string().min(1).max(200).optional(),
    discount: z.number().positive().max(100).optional(),
    Description: z.string().min(1).max(500).optional(),
    BuyCategory: z.array(z.string()).min(1).optional(),
    GetCategory: z.array(z.string()).min(1).optional(),
    type: CouponTypeEnum.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
);

// Export types inferred from schemas
export type NewCouponInput = z.infer<typeof newCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
