import { z } from "zod";

// Schema for POST /coupons - Create new coupon
export const createCouponSchema = z.object({
    id: z.string().min(1, "Coupon ID is required"),
    name: z.string().min(1, "Name is required"),
    type: z.enum(["cart", "Product", "BxGy"]),
    isActive: z.boolean().optional(),
    expiryDate: z.coerce.date().optional(),
    usageLimit: z.number().int().positive().optional(),
    usedCount: z.number().int().nonnegative().optional(),
    conditions: z.any(), // Accept any object for conditions
    discountDetails: z.any() // Accept any object for discount details
});

// Schema for PUT /coupons/:id - Update coupon
export const updateCouponSchema = z.object({
    name: z.string().min(1).optional(),
    type: z.enum(["cart", "Product", "BxGy"]).optional(),
    isActive: z.boolean().optional(),
    expiryDate: z.coerce.date().optional(),
    usageLimit: z.number().int().positive().optional(),
    usedCount: z.number().int().nonnegative().optional(),
    conditions: z.any().optional(),
    discountDetails: z.any().optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
);

// Schema for cart items
export const cartItemSchema = z.object({
    product_id: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    price: z.number().nonnegative("Price must be non-negative")
});

// Schema for POST /applicable-coupons and POST /apply-coupon/:id
export const cartRequestSchema = z.object({
    cart: z.object({
        id: z.string().optional(),
        items: z.array(cartItemSchema).min(1, "Cart must have at least one item"),
        totalAmount: z.number().nonnegative().optional(),
        discountedAmount: z.number().nonnegative().optional(),
        subTotal: z.number().nonnegative().optional()
    })
});

// Export types
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CartRequestInput = z.infer<typeof cartRequestSchema>;
