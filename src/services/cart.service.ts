import { Redis } from 'ioredis';
import type { Cart } from '../types/cart.type.js';
import type { ApplicableCoupons, Coupon } from '../types/coupon.type.js';
import { CartFactory } from '../handlers/CartFactory.js';

export class CartService {
    private redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
            host: process.env.REDIS_HOST || "127.0.0.1",
        });

        this.redisClient.on("error", (err) => console.error(`Redis connection error: ${err}`));
    }

    /**
     * Create a new coupon and store in Redis
     */
    async createCoupon(coupon: Coupon): Promise<Coupon> {
        const key = `coupon:${coupon.id}`;
        await this.redisClient.set(key, JSON.stringify(coupon));
        return coupon;
    }

    /**
     * Get all coupons from Redis
     */
    async getAllCoupons(): Promise<Coupon[]> {
        const keys = await this.redisClient.keys('*');
        const coupons: Coupon[] = [];

        do{
            const key = await this.redisClient.lpop('keys');
            if(key){
                const data = await this.redisClient.get(key);
                if(data){
                    coupons.push(JSON.parse(data));
                }
            }
        }while(keys.length > 0);

       
        return coupons;
    }

    /**
     * Get a specific coupon by ID
     */
    async getCouponById(id: string): Promise<Coupon | null> {
        const key = `coupon:${id}`;
        const data = await this.redisClient.get(key);

        if (!data) {
            return null;
        }

        return JSON.parse(data);
    }

    /**
     * Update an existing coupon
     */
    async updateCoupon(id: string, coupon: Coupon): Promise<Coupon | null> {
        const key = `coupon:${id}`;
        const existingCoupon = await this.getCouponById(id);

        if (!existingCoupon) {
            return null;
        }

        await this.redisClient.set(key, JSON.stringify(coupon));
        return coupon;
    }

    /**
     * Delete a coupon by ID
     */
    async deleteCoupon(id: string): Promise<boolean> {
        const key = `coupon:${id}`;
        const result = await this.redisClient.del(key);
        return result > 0;
    }

    /**
     * Find all applicable coupons for a given cart
     * Returns array of applicable coupons with calculated discounts
     */
    async findApplicableCoupons(cart: Cart): Promise<ApplicableCoupons[]> {
        const allCoupons = await this.getAllCoupons();

        const activeCoupons = allCoupons.filter(coupon => {
            if (!coupon.isActive) return false;

            if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
                return false;
            }


            //checks the usage limit of the coupon
            if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                return false;
            }

            return true;
        });

        // Group coupons by type
        const couponsByType: { [key: string]: Coupon[] } = {
            cart: [],
            product: [],
            BxGy: []
        };

        for (const coupon of activeCoupons) {
            const type = coupon.type === 'Product' ? 'product' : coupon.type;
            if (couponsByType[type]) {
                couponsByType[type].push(coupon);
            }
        }

        // Find applicable coupons for each type
        const applicableCoupons: ApplicableCoupons[] = [];

        for (const [type, coupons] of Object.entries(couponsByType)) {
            if (coupons.length === 0) continue;

            const strategy = CartFactory.getStrategy(type);
            if (!strategy) continue;

            const applicable = strategy.isApplicable(cart, coupons);
            applicableCoupons.push(...applicable);
        }

        // Sort by discount amount (highest first)
        return applicableCoupons.sort((a, b) => b.discount - a.discount);
    }

    /**
     * Apply a specific coupon to a cart
     * Returns the updated cart with discount applied
     */
    async applyCoupon(cart: Cart, couponId: string): Promise<Cart | null> {
        const coupon = await this.getCouponById(couponId);

        if (!coupon) {
            throw new Error(`Coupon with ID ${couponId} not found`);
        }

        if (!coupon.isActive) {
            throw new Error('Coupon is not active');
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            throw new Error('Coupon has expired');
        }

        // Check usage limit of the coupon
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Coupon usage limit exceeded');
        }

        // Get the appropriate strategy
        const type = coupon.type === 'Product' ? 'product' : coupon.type;
        const strategy = CartFactory.getStrategy(type);

        if (!strategy) {
            throw new Error(`Invalid coupon type: ${coupon.type}`);
        }

        // Check if coupon is applicable
        const applicableCoupons = strategy.isApplicable(cart, [coupon]);

        if (applicableCoupons.length === 0) {
            throw new Error('Coupon is not applicable to this cart');
        }

        // Apply the discount
        const updatedCart = strategy.applyDiscount(cart, coupon);

        // Increment usage count
        coupon.usedCount += 1;
        await this.updateCoupon(couponId, coupon);

        return updatedCart;
    }

    /**
     * Calculate cart total from items
     */
    calculateCartTotal(cart: Cart): number {
        return cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    /**
     * Close Redis connection
     */
    async close(): Promise<void> {
        await this.redisClient.quit();
    }
}
