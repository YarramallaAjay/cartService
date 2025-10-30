import type { Product } from "./product.type.js";

export type Cart={
    id:string;
    items:Product[];
    totalAmount:number;
    discountedAmount:number;
    subTotal:number;
}
