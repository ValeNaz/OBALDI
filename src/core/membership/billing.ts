import Stripe from "stripe";
import { getStripeClient, getStripePriceId } from "@/src/core/payments/stripe";
import { prisma } from "@/src/core/db";

/**
 * Get subscription details from Stripe
 */
export const getSubscription = async (providerSubId: string): Promise<Stripe.Subscription> => {
    return getStripeClient().subscriptions.retrieve(providerSubId, {
        expand: ["default_payment_method", "latest_invoice"]
    });
};

/**
 * Cancel a subscription
 * @param providerSubId - Stripe subscription ID
 * @param atPeriodEnd - If true, cancels at current period end; if false, cancels immediately
 */
export const cancelSubscription = async (
    providerSubId: string,
    atPeriodEnd: boolean = true
): Promise<Stripe.Subscription> => {
    if (atPeriodEnd) {
        return getStripeClient().subscriptions.update(providerSubId, {
            cancel_at_period_end: true
        });
    }
    return getStripeClient().subscriptions.cancel(providerSubId);
};

/**
 * Resume a subscription that was set to cancel at period end
 */
export const resumeSubscription = async (
    providerSubId: string
): Promise<Stripe.Subscription> => {
    return getStripeClient().subscriptions.update(providerSubId, {
        cancel_at_period_end: false
    });
};

/**
 * Update subscription to a different plan
 * @param providerSubId - Stripe subscription ID
 * @param newPlanCode - The new plan code (ACCESSO or TUTELA)
 * @returns Updated subscription
 */
export const updateSubscriptionPlan = async (
    providerSubId: string,
    newPlanCode: "ACCESSO" | "TUTELA"
): Promise<Stripe.Subscription> => {
    const subscription = await getStripeClient().subscriptions.retrieve(providerSubId);

    if (!subscription.items.data.length) {
        throw new Error("Subscription has no items");
    }

    const subscriptionItemId = subscription.items.data[0].id;
    const newPriceId = getStripePriceId(newPlanCode);

    return getStripeClient().subscriptions.update(providerSubId, {
        items: [
            {
                id: subscriptionItemId,
                price: newPriceId
            }
        ],
        proration_behavior: "create_prorations"
    });
};

/**
 * Toggle auto-renewal for a subscription
 */
export const toggleAutoRenew = async (
    providerSubId: string,
    enabled: boolean
): Promise<Stripe.Subscription> => {
    return getStripeClient().subscriptions.update(providerSubId, {
        cancel_at_period_end: !enabled
    });
};

/**
 * Get invoices for a customer
 * @param customerId - Stripe customer ID
 * @param limit - Number of invoices to fetch
 * @param startingAfter - Cursor for pagination
 */
export const getInvoices = async (
    customerId: string,
    limit: number = 10,
    startingAfter?: string
): Promise<Stripe.ApiList<Stripe.Invoice>> => {
    return getStripeClient().invoices.list({
        customer: customerId,
        limit,
        ...(startingAfter && { starting_after: startingAfter })
    });
};

/**
 * Get customer ID from subscription
 */
export const getCustomerIdFromSubscription = async (providerSubId: string): Promise<string> => {
    const subscription = await getStripeClient().subscriptions.retrieve(providerSubId);
    return typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;
};

/**
 * Create a Stripe Customer Portal session
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to redirect to after portal session
 */
export const createBillingPortalSession = async (
    customerId: string,
    returnUrl: string
): Promise<Stripe.BillingPortal.Session> => {
    return getStripeClient().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
    });
};

/**
 * Get full billing details for a user
 */
export const getBillingDetails = async (userId: string) => {
    const membership = await prisma.membership.findUnique({
        where: { userId },
        include: { plan: true }
    });

    if (!membership) {
        return null;
    }

    // Check if this is a demo account (subscription ID starts with "demo_")
    const isDemo = membership.providerSubId.startsWith("demo_");

    if (isDemo) {
        // Return mock data for demo accounts
        return {
            membership: {
                id: membership.id,
                status: membership.status,
                autoRenew: membership.autoRenew,
                currentPeriodStart: membership.currentPeriodStart,
                currentPeriodEnd: membership.currentPeriodEnd
            },
            plan: {
                code: membership.plan.code,
                priceCents: membership.plan.priceCents,
                currency: membership.plan.currency,
                periodDays: membership.plan.periodDays
            },
            subscription: {
                id: membership.providerSubId,
                status: "active",
                cancelAtPeriodEnd: !membership.autoRenew,
                currentPeriodEnd: membership.currentPeriodEnd
            },
            customerId: `demo_customer_${userId}`,
            paymentMethod: {
                type: "card",
                last4: "4242",
                brand: "visa",
                expMonth: 12,
                expYear: 2030
            },
            isDemo: true
        };
    }

    const subscription = await getSubscription(membership.providerSubId);

    const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    // Get payment method details if available
    let paymentMethod: {
        type: string;
        last4?: string;
        brand?: string;
        expMonth?: number;
        expYear?: number;
    } | null = null;

    if (subscription.default_payment_method && typeof subscription.default_payment_method !== "string") {
        const pm = subscription.default_payment_method;
        if (pm.card) {
            paymentMethod = {
                type: "card",
                last4: pm.card.last4,
                brand: pm.card.brand,
                expMonth: pm.card.exp_month,
                expYear: pm.card.exp_year
            };
        }
    }

    return {
        membership: {
            id: membership.id,
            status: membership.status,
            autoRenew: !subscription.cancel_at_period_end,
            currentPeriodStart: membership.currentPeriodStart,
            currentPeriodEnd: membership.currentPeriodEnd
        },
        plan: {
            code: membership.plan.code,
            priceCents: membership.plan.priceCents,
            currency: membership.plan.currency,
            periodDays: membership.plan.periodDays
        },
        subscription: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        },
        customerId,
        paymentMethod
    };
};
