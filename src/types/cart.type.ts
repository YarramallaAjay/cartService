import type { CartItem, Product } from "./product.type.js";

export type Cart={
    id?:string | undefined;
    items:CartItem[];
    totalAmount:number;
    discountedAmount?:number | undefined;
    subTotal?:number | undefined;
}
