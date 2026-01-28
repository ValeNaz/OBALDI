import Stripe from "stripe";
import { getRequiredEnv } from "@/src/core/config";

let stripeClient: Stripe | null = null;

export const getStripeClient = () => {
  if (!stripeClient) {
    stripeClient = new Stripe(getRequiredEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2025-02-24.acacia"
    });
  }
  return stripeClient;
};

export const getStripePriceId = (planCode: "ACCESSO" | "TUTELA") => {
  if (planCode === "ACCESSO") {
    return getRequiredEnv("STRIPE_PRICE_ID_ACCESSO");
  }
  return getRequiredEnv("STRIPE_PRICE_ID_TUTELA");
};

export const getStripeWebhookSecret = () => getRequiredEnv("STRIPE_WEBHOOK_SECRET");
