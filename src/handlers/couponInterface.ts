import type { Cart } from "../types/cart.type.js";
import type { ApplicableCoupons, Coupon } from "../types/coupon.type.js";

export interface CouponStrategy{
    isApplicable(cart:Cart, coupon:Coupon[]):ApplicableCoupons[]
    calculateDiscount(cart:Cart,coupon:Coupon):number;
    applyDiscount(cart:Cart,coupon:Coupon):Cart;
}

