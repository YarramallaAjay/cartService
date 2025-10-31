    import Express, { type Express as ExpressApp } from "express"
    import WarmUp from "./startUpInstance.js"
    import { CartService } from "./services/cart.service.js"
    import { createCouponSchema, updateCouponSchema, cartRequestSchema } from "./validations/newCouponSchema.js"
    import type { Coupon } from "./types/coupon.type.js"
    import type { Cart } from "./types/cart.type.js"
    import StartUpInstance from "./startUpInstance.js"

    const app:ExpressApp=Express()
    const cartService = new CartService()

    // Middleware
    app.use(Express.json())

    const {startAll}=await StartUpInstance()
    await startAll("Redis")

    // POST /coupons - Create a new coupon
    app.post("/coupons",async(req,res)=>{
        try {
            const validated = createCouponSchema.parse(req.body)
            const couponData = {
                ...validated,
                isActive: validated.isActive ?? true,
                usedCount: validated.usedCount ?? 0
            }
            const created = await cartService.createCoupon(couponData as Coupon)
            return res.status(201).json(created)
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors })
            }
            return res.status(500).json({ error: "Failed to create coupon", details: error.message })
        }
    })

    // GET /coupons - Retrieve all coupons
    app.get("/coupons",async(req,res)=>{
        try {
            const coupons = await cartService.getAllCoupons()
            return res.status(200).json(coupons)
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to retrieve coupons", details: error.message })
        }
    })

    // GET /coupons/:id - Retrieve a specific coupon by its ID
    app.get("/coupons/:id",async(req,res)=>{
        try {
            const coupon = await cartService.getCouponById(req.params.id)

            if (!coupon) {
                return res.status(404).json({ error: "Coupon not found" })
            }

            return res.status(200).json(coupon)
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to retrieve coupon", details: error.message })
        }
    })

    // PUT /coupons/:id - Update a specific coupon by its ID
    app.put("/coupons/:id",async(req,res)=>{
        try {
            const validated = updateCouponSchema.parse(req.body)
            const updated = await cartService.updateCoupon(req.params.id, { ...validated, id: req.params.id } as Coupon)

            if (!updated) {
                return res.status(404).json({ error: "Coupon not found" })
            }

            return res.status(200).json(updated)
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors })
            }
            return res.status(500).json({ error: "Failed to update coupon", details: error.message })
        }
    })

    // DELETE /coupons/:id - Delete a specific coupon by its ID
    app.delete("/coupons/:id",async(req,res)=>{
        try {
            const deleted = await cartService.deleteCoupon(req.params.id)

            if (!deleted) {
                return res.status(404).json({ error: "Coupon not found" })
            }

            return res.status(200).json({ message: "Coupon deleted successfully" })
        } catch (error: any) {
            return res.status(500).json({ error: "Failed to delete coupon", details: error.message })
        }
    })

    // POST /applicable-coupons - Fetch all applicable coupons for a given cart
    app.post("/applicable-coupons",async(req,res)=>{
        try {
            const validated = cartRequestSchema.parse(req.body)
            const cart = validated.cart

            // Calculate total amount if not provided
            if (!cart.totalAmount) {
                cart.totalAmount = cartService.calculateCartTotal(cart as Cart)
            }

            const applicableCoupons = await cartService.findApplicableCoupons(cart as Cart)

            return res.status(200).json({ applicable_coupons: applicableCoupons })
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors })
            }
            return res.status(500).json({ error: "Failed to find applicable coupons", details: error.message })
        }
    })

    // POST /apply-coupon/:id - Apply a specific coupon to the cart
    app.post("/apply-coupon/:id",async(req,res)=>{
        try {
            const validated = cartRequestSchema.parse(req.body)
            const cart = validated.cart
            const couponId = req.params.id

            // Calculate total amount if not provided
            if (!cart.totalAmount) {
                cart.totalAmount = cartService.calculateCartTotal(cart as Cart)
            }

            const updatedCart = await cartService.applyCoupon(cart as Cart, couponId)

            return res.status(200).json({ updated_cart: updatedCart })
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return res.status(400).json({ error: "Validation failed", details: error.errors })
            }
            return res.status(400).json({ error: error.message })
        }
    })

    // Start server
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })

    export default app




