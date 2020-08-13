import Stripe from "stripe";

if (!process.env.stripeKey) throw new Error("Stripe not configured");

export const stripe = new Stripe(process.env.stripeKey, { apiVersion: "2020-03-02" });

export default stripe;
