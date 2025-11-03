import type { Cart } from "../types/cart.type.js";
import type { ApplicableCoupons, Coupon, ProductWiseConditions } from "../types/coupon.type.js";
import type { CouponStrategy } from "./couponInterface.js";

export class ProductWiseHandler implements CouponStrategy{


    constructor(){

    }

    isApplicable(cart: Cart, coupons: Coupon[]): ApplicableCoupons[] {
        const applicable: ApplicableCoupons[] = [];

        if (!cart.items || cart.items.length === 0) {
            return [];
        }

        for (const coupon of coupons) {
            const conditions = coupon.conditions as ProductWiseConditions;

            let hasApplicableProducts = false;
            let totalQuantityOfApplicableProducts = 0;

            for (const item of cart.items) {
                const isProductMatch = conditions.productIds &&
                                     conditions.productIds.includes(item.product_id);

                const isCategoryMatch = conditions.categories &&
                                      item.category &&
                                      conditions.categories.includes(item.category);

                if (isProductMatch || isCategoryMatch) {
                    hasApplicableProducts = true;
                    totalQuantityOfApplicableProducts += item.quantity;
                }
            }

            if (!hasApplicableProducts) continue;

            if (conditions.minQuantity &&
                totalQuantityOfApplicableProducts < conditions.minQuantity) {
                continue;
            }

            const discount = this.calculateDiscount(cart, coupon);

            if (discount <= 0) continue;

            applicable.push({
                id: coupon.id,
                discount,
                type: 'product'
            });
        }

        return applicable;
    }

    calculateDiscount(cart: Cart, coupon: Coupon): number {
        const conditions = coupon.conditions as ProductWiseConditions;
        const discountDetails = coupon.discountDetails;
        let totalDiscount = 0;

        for (const item of cart.items) {
            const isProductMatch = conditions.productIds &&
                                 conditions.productIds.includes(item.product_id);

            const isCategoryMatch = conditions.categories &&
                                  item.category &&
                                  conditions.categories.includes(item.category);

            if (!isProductMatch && !isCategoryMatch) continue;

            const itemTotal = item.price * item.quantity;

            if (discountDetails.type === 'percentage') {
                let itemDiscount = Math.floor((itemTotal * discountDetails.value) / 100);

                if (discountDetails.maxDiscount) {
                    itemDiscount = Math.min(itemDiscount, discountDetails.maxDiscount);
                }

                totalDiscount += itemDiscount;
            } else if (discountDetails.type === 'fixed') {
                totalDiscount += Math.floor(discountDetails.value * item.quantity);
            }
        }

        return totalDiscount;
    }

    applyDiscount(cart: Cart, coupon: Coupon): Cart {
        const conditions = coupon.conditions as ProductWiseConditions;
        const discountDetails = coupon.discountDetails;
        let totalDiscount = 0;

        for (const item of cart.items) {
            const isProductMatch = conditions.productIds &&
                                 conditions.productIds.includes(item.product_id);

            const isCategoryMatch = conditions.categories &&
                                  item.category &&
                                  conditions.categories.includes(item.category);

            if (!isProductMatch && !isCategoryMatch) continue;

            const itemTotal = item.price * item.quantity;
            let itemDiscount = 0;

            if (discountDetails.type === 'percentage') {
                itemDiscount = Math.floor((itemTotal * discountDetails.value) / 100);

                if (discountDetails.maxDiscount) {
                    itemDiscount = Math.min(itemDiscount, discountDetails.maxDiscount);
                }
            } else if (discountDetails.type === 'fixed') {
                itemDiscount = Math.floor(discountDetails.value * item.quantity);
            }

            item.total_discount = itemDiscount;
            item.final_price = itemTotal - itemDiscount;

            if (!item.appliedCouponIds) {
                item.appliedCouponIds = [];
            }
            item.appliedCouponIds.push(coupon.id);

            totalDiscount += itemDiscount;
        }

        cart.discountedAmount = totalDiscount;
        cart.subTotal = cart.totalAmount - totalDiscount;

        return cart;
    }

}