import type { Cart } from "../types/cart.type.js";
import type { ApplicableCoupons, Coupon } from "../types/coupon.type.js";
import type { CouponStrategy } from "./couponInterface.js";

class BxGyHandler implements CouponStrategy{
    isApplicable(cart: Cart, coupon: Coupon[]): ApplicableCoupons[] {
        throw new Error("Method not implemented.");
    }
    calculateDiscount(cart: Cart, coupon: Coupon): number {
        throw new Error("Method not implemented.");
    }
    applyDiscount(cart: Cart, coupon: Coupon): Cart {
        throw new Error("Method not implemented.");
    }
   

}