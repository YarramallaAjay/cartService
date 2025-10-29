export type Coupon={

    id:string,
    name:string,
    discount:number,
    Description:string,
    BuyCategory:string[], //these are the products applicable for the discounts if they bought
    GetCategory:string[], //these are the categories applicable for the Get products.
    type:string //"Product" or " cart" or "BxGy"
}

