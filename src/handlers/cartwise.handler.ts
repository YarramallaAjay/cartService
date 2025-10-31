import type { Cart } from "../types/cart.type.js";
import type { ApplicableCoupons, CartWiseConditions, Coupon, CouponConditions, DiscountDetails } from "../types/coupon.type.js";
import type { CouponStrategy } from "./couponInterface.js";

export class CartWiseHandler implements CouponStrategy{

    constructor(){
        
    }
    isApplicable(cart: Cart, coupons: Coupon[]): ApplicableCoupons[] {
        const applicable: ApplicableCoupons[] = [];
        const totalAmount = cart.totalAmount;

    if (!cart.items || cart.items.length === 0) {
        return [];
    }

    for(const coupon of coupons){
        const conditions = coupon.conditions as CartWiseConditions;

        if(totalAmount < conditions.minCartValue) continue;
        if(conditions.maxCartValue && totalAmount > conditions.maxCartValue) continue;

        if(conditions.minItems && cart.items.length < conditions.minItems) continue;

        const discount = this.calculateDiscount(cart, coupon);

        if(discount <= 0) continue;

        applicable.push({
            id: coupon.id,
            discount,
            type: 'cart'
        });
    }

    return applicable;

    }
    calculateDiscount(cart: Cart, coupon: Coupon): number {
        const couponDiscount=coupon.discountDetails
        let discount=0;
        if(couponDiscount.type==='percentage'){
            const calculatedDiscount=Math.floor(cart.totalAmount/100)
            discount= couponDiscount.maxDiscount?Math.min(couponDiscount.maxDiscount,calculatedDiscount):calculatedDiscount
            
        }
        if(couponDiscount.type==='fixed'){
            discount= Math.floor(couponDiscount.value);
        }
        return discount;

    }
    applyDiscount(cart: Cart, coupon: Coupon): Cart {
        const discount = this.calculateDiscount(cart, coupon);  // DRY principle
        cart.discountedAmount = discount;
        cart.subTotal = cart.totalAmount - discount;
        return cart;
    }
   

}
