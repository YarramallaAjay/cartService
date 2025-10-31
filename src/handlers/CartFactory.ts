import { BxGyHandler } from "./BxGy.handler.js"
import { CartWiseHandler } from "./cartwise.handler.js"
import type { CouponStrategy } from "./couponInterface.js"
import { ProductWiseHandler } from "./productwise.handler.js"

export class CartFactory{

    private static cartHandler=new CartWiseHandler()
    private static ProductHandler=new ProductWiseHandler()
    private static BxGyHandler=new BxGyHandler()


    constructor(){

    }


    public static getStrategy(type:string):CouponStrategy|null{
        if(!type){
            return null;
        }

        switch(type){
            case 'cart':
                return this.cartHandler;

            case 'product':
                return this.ProductHandler;

            case 'BxGy':
                return this.BxGyHandler;

            default:
                return null;
        }

    }
}