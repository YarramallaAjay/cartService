import type { CartItem, Product } from "./product.type.js";

export type Cart={
    id:string;
    items:CartItem[];
    totalAmount:number;
    discountedAmount:number;
    subTotal:number;
}
