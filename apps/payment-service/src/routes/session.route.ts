import { Hono } from "hono";
import stripe from "../utils/stripe";
import { shouldBeUser } from "../middleware/authMiddleware";
import { CartItemsType } from "@repo/types";
import { getStripeProductPrice } from "../utils/stripe-products";

const sessionRoute = new Hono();

sessionRoute.post("/create-checkout-session", shouldBeUser, async (c) => {
  const { cart }: { cart: CartItemsType } = await c.req.json();
  const userId = await c.get("userId");
  const lineItems = await Promise.all(
    cart.map(async (item) => {
      const unit_amount = await getStripeProductPrice(item.id.toString());
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: unit_amount as number,
        },
        quantity: item.quantity,
      };
    })
  );
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      client_reference_id: userId || undefined,
      mode: "payment",
      ui_mode: "custom",
      // The URL of your payment completion page
      return_url:
        "http://localhost:3002/return?session_id={CHECKOUT_SESSION_ID}",
    });
    console.log("client_secret:", session.client_secret);

    return c.json({ checkoutSessionClientSecret: session.client_secret });
  } catch (error) {
    console.log(error);
    return c.json(error);
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  const session = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["line_items"],
    }
  );
  console.log("console", session.payment_status);
  return c.json({
    status: session.status,
    paymentstatus: session.payment_status,
  });
});

export default sessionRoute;
