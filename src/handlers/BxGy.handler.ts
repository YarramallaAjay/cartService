import type { Cart } from "../types/cart.type.js";
import type { ApplicableCoupons, BxGyConditions, Coupon } from "../types/coupon.type.js";
import type { CouponStrategy } from "./couponInterface.js";

export class BxGyHandler implements CouponStrategy{

    constructor(){

    }

    private calculateBxGyParams(cart: Cart, conditions: BxGyConditions) {
        const requiredBuyQuantity = conditions.buyProducts.reduce((sum, p) => sum + p.quantity, 0);

        let totalBuyQuantityInCart = 0;
        for (const buyProduct of conditions.buyProducts) {
            const cartItem = cart.items.find(item => item.product_id === buyProduct.productId);
            if (cartItem) {
                totalBuyQuantityInCart += cartItem.quantity;
            }
        }

        const maxPossibleRepetitions = Math.floor(totalBuyQuantityInCart / requiredBuyQuantity);
        const actualRepetitions = Math.min(maxPossibleRepetitions, conditions.repetitionLimit);

        const requiredGetQuantity = conditions.getProducts.reduce((sum, p) => sum + p.quantity, 0);

        return {
            requiredBuyQuantity,
            totalBuyQuantityInCart,
            actualRepetitions,
            requiredGetQuantity
        };
    }

    isApplicable(cart: Cart, coupons: Coupon[]): ApplicableCoupons[] {
        const applicable: ApplicableCoupons[] = [];

        if (!cart.items || cart.items.length === 0) {
            return [];
        }

        for (const coupon of coupons) {
            const conditions = coupon.conditions as BxGyConditions;
            const params = this.calculateBxGyParams(cart, conditions);

            if (params.totalBuyQuantityInCart < params.requiredBuyQuantity) continue;
            if (params.actualRepetitions === 0) continue;

            let totalGetQuantityInCart = 0;
            for (const getProduct of conditions.getProducts) {
                const cartItem = cart.items.find(item => item.product_id === getProduct.productId);
                if (cartItem) {
                    totalGetQuantityInCart += cartItem.quantity;
                }
            }

            const freeQuantity = Math.min(totalGetQuantityInCart, params.actualRepetitions * params.requiredGetQuantity);
            if (freeQuantity === 0) continue;

            const discount = this.calculateDiscount(cart, coupon);
            if (discount <= 0) continue;

            applicable.push({
                id: coupon.id,
                discount,
                type: 'BxGy'
            });
        }

        return applicable;
    }

    calculateDiscount(cart: Cart, coupon: Coupon): number {
        const conditions = coupon.conditions as BxGyConditions;
        const params = this.calculateBxGyParams(cart, conditions);

        if (params.actualRepetitions === 0) return 0;

        let totalDiscount = 0;
        let remainingFreeQuantity = params.actualRepetitions * params.requiredGetQuantity;

        for (const getProduct of conditions.getProducts) {
            if (remainingFreeQuantity === 0) break;

            const cartItem = cart.items.find(item => item.product_id === getProduct.productId);
            if (!cartItem) continue;

            const freeQuantity = Math.min(cartItem.quantity, remainingFreeQuantity);
            totalDiscount += freeQuantity * cartItem.price;
            remainingFreeQuantity -= freeQuantity;
        }

        return Math.floor(totalDiscount);
    }

    applyDiscount(cart: Cart, coupon: Coupon): Cart {
        const conditions = coupon.conditions as BxGyConditions;
        const params = this.calculateBxGyParams(cart, conditions);

        if (params.actualRepetitions === 0) return cart;

        let totalDiscount = 0;
        let remainingFreeQuantity = params.actualRepetitions * params.requiredGetQuantity;

        for (const getProduct of conditions.getProducts) {
            if (remainingFreeQuantity === 0) break;

            const cartItem = cart.items.find(item => item.product_id === getProduct.productId);
            if (!cartItem) continue;

            const freeQuantity = Math.min(cartItem.quantity, remainingFreeQuantity);
            const itemDiscount = freeQuantity * cartItem.price;

            cartItem.freeQuantity = freeQuantity;
            cartItem.total_discount = Math.floor(itemDiscount);
            cartItem.final_price = (cartItem.quantity * cartItem.price) - cartItem.total_discount;

            if (!cartItem.appliedCouponIds) {
                cartItem.appliedCouponIds = [];
            }
            cartItem.appliedCouponIds.push(coupon.id);

            totalDiscount += itemDiscount;
            remainingFreeQuantity -= freeQuantity;
        }

        cart.discountedAmount = Math.floor(totalDiscount);
        cart.subTotal = cart.totalAmount - cart.discountedAmount;

        return cart;
    }


}