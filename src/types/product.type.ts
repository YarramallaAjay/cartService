export type Product={
    id:string,
    productCode:string,
    type:string,
    description:string,
    price:number
}

export type CartItem = {
    product_id: string;
    quantity: number;
    price: number;
    category?: string;

    subtotal?: number;
    discount?: number;
    total_discount?: number;
    final_price?: number;

    isFree?: boolean;
    freeQuantity?: number;
    appliedCouponIds?: string[];
}

