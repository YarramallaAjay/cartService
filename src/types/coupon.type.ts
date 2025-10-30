export type Coupon = {
    id: string;
    name: string;
    type: "cart" | "Product" | "BxGy";
    
    // Status fields
    isActive: boolean;
    expiryDate?: Date;
    usageLimit?: number;
    usedCount: number;
    
    // Conditions (varies by type)
    conditions: CouponConditions;
    
    // Discount details (varies by type)
    discountDetails: DiscountDetails;
}

// Different condition types
export type CouponConditions =  
    | CartWiseConditions
    | ProductWiseConditions
    | BxGyConditions;

export type CartWiseConditions = {
    minCartValue: number;
    maxCartValue?: number;
    minItems?: number;
    applicableCategories?: string[];
    excludedCategories?: string[];
}

export type ProductWiseConditions = {
    productIds?: string[];
    categories?: string[];
    minQuantity?: number;
}

export type BxGyConditions = {
    buyProducts: Array<{ productId: string; quantity: number }>;
    getProducts: Array<{ productId: string; quantity: number }>;
    repetitionLimit: number;
}

// Discount types
export type DiscountDetails = 
    | { type: "percentage"; value: number; maxDiscount?: number }
    | { type: "fixed"; value: number }
    | { type: "freeProduct"|"discountedProduct" }; // for BxGy



export type ApplicableCoupons={
    id:string,
    type:string,
    discount:number
}