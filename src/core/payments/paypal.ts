import { getAppBaseUrl, getRequiredEnv } from "@/src/core/config";

const getPayPalBaseUrl = () =>
  process.env.PAYPAL_API_BASE_URL ?? "https://api-m.paypal.com";

const getPayPalAccessToken = async () => {
  const clientId = getRequiredEnv("PAYPAL_CLIENT_ID");
  const clientSecret = getRequiredEnv("PAYPAL_CLIENT_SECRET");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal token error: ${text}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

const paypalRequest = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal request failed: ${text}`);
  }

  return response.json() as Promise<T>;
};

export const getPayPalPlanId = (planCode: "ACCESSO" | "TUTELA") => {
  if (planCode === "ACCESSO") {
    return getRequiredEnv("PAYPAL_PLAN_ID_ACCESSO");
  }
  return getRequiredEnv("PAYPAL_PLAN_ID_TUTELA");
};

export const createPayPalSubscription = async (params: {
  planCode: "ACCESSO" | "TUTELA";
  email: string;
}) => {
  const subscription = await paypalRequest<{
    id: string;
    status: string;
    links: Array<{ rel: string; href: string }>;
  }>("/v1/billing/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: getPayPalPlanId(params.planCode),
      subscriber: {
        email_address: params.email
      },
      application_context: {
        return_url: `${getAppBaseUrl()}/membership/success/paypal`,
        cancel_url: `${getAppBaseUrl()}/membership/cancel`
      }
    })
  });

  const approvalLink = subscription.links.find((link) => link.rel === "approve");
  if (!approvalLink) {
    throw new Error("PayPal approval link missing.");
  }

  return {
    id: subscription.id,
    approvalUrl: approvalLink.href
  };
};

export const getPayPalSubscription = async (subscriptionId: string) => {
  return paypalRequest<{
    id: string;
    status: string;
    billing_info?: {
      next_billing_time?: string;
      last_payment?: {
        time?: string;
      };
    };
  }>(`/v1/billing/subscriptions/${subscriptionId}`);
};

export const verifyPayPalWebhookSignature = async (params: {
  headers: Headers;
  event: Record<string, unknown>;
}) => {
  const webhookId = getRequiredEnv("PAYPAL_WEBHOOK_ID");

  const payload = {
    auth_algo: params.headers.get("paypal-auth-algo"),
    cert_url: params.headers.get("paypal-cert-url"),
    transmission_id: params.headers.get("paypal-transmission-id"),
    transmission_sig: params.headers.get("paypal-transmission-sig"),
    transmission_time: params.headers.get("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: params.event
  };

  const result = await paypalRequest<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

  return result.verification_status === "SUCCESS";
};
