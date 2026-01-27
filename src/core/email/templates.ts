import { getAppBaseUrl } from "@/src/core/config";

type OrderEmailItem = {
  title: string;
  qty: number;
  unitPriceCents: number;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMoney = (cents: number, currency: string) =>
  `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;

const formatDate = (value: Date) => value.toISOString().slice(0, 10);

const formatPlanLabel = (code: string) => {
  if (code === "ACCESSO") return "Accesso";
  if (code === "TUTELA") return "Tutela";
  return code;
};

export const renderOrderConfirmation = (params: {
  orderId: string;
  totalCents: number;
  currency: string;
  pointsSpent: number;
  items: OrderEmailItem[];
}) => {
  const orderUrl = `${getAppBaseUrl()}/orders`;
  const itemsHtml = params.items
    .map(
      (item) =>
        `<li>${item.qty} x ${escapeHtml(item.title)} - ${formatMoney(
          item.unitPriceCents * item.qty,
          params.currency
        )}</li>`
    )
    .join("");

  const pointsLine =
    params.pointsSpent > 0 ? `<p>Punti usati: ${params.pointsSpent}</p>` : "";

  const html = `
    <p>Ciao,</p>
    <p>Il tuo ordine e stato confermato.</p>
    <p>Ordine: ${escapeHtml(params.orderId)}</p>
    <ul>${itemsHtml}</ul>
    <p>Totale: ${formatMoney(params.totalCents, params.currency)}</p>
    ${pointsLine}
    <p>Puoi seguire l'ordine qui: <a href="${orderUrl}">${orderUrl}</a></p>
  `;

  const textLines = [
    "Il tuo ordine e stato confermato.",
    `Ordine: ${params.orderId}`,
    ...params.items.map(
      (item) =>
        `${item.qty} x ${item.title} - ${formatMoney(
          item.unitPriceCents * item.qty,
          params.currency
        )}`
    ),
    `Totale: ${formatMoney(params.totalCents, params.currency)}`,
    params.pointsSpent > 0 ? `Punti usati: ${params.pointsSpent}` : "",
    `Dettagli ordine: ${orderUrl}`
  ].filter(Boolean);

  return {
    subject: "Conferma ordine Obaldi",
    html,
    text: textLines.join("\n")
  };
};

export const renderMembershipConfirmation = (params: {
  planCode: string;
  currentPeriodEnd: Date;
}) => {
  const planLabel = formatPlanLabel(params.planCode);
  const endDate = formatDate(params.currentPeriodEnd);
  const membershipUrl = `${getAppBaseUrl()}/membership`;

  const html = `
    <p>Ciao,</p>
    <p>La tua membership Obaldi e attiva.</p>
    <p>Piano: ${escapeHtml(planLabel)}</p>
    <p>Scadenza periodo corrente: ${endDate}</p>
    <p>Dettagli: <a href="${membershipUrl}">${membershipUrl}</a></p>
  `;

  const text = [
    "La tua membership Obaldi e attiva.",
    `Piano: ${planLabel}`,
    `Scadenza periodo corrente: ${endDate}`,
    `Dettagli: ${membershipUrl}`
  ].join("\n");

  return {
    subject: "Membership Obaldi attiva",
    html,
    text
  };
};

export const renderMembershipRenewal = (params: {
  planCode: string;
  currentPeriodEnd: Date;
  pointsAwarded: number;
}) => {
  const planLabel = formatPlanLabel(params.planCode);
  const endDate = formatDate(params.currentPeriodEnd);
  const pointsLine =
    params.pointsAwarded > 0 ? `Punti accreditati: ${params.pointsAwarded}` : "";

  const html = `
    <p>Ciao,</p>
    <p>Il rinnovo della tua membership Obaldi e avvenuto con successo.</p>
    <p>Piano: ${escapeHtml(planLabel)}</p>
    <p>Nuova scadenza: ${endDate}</p>
    ${pointsLine ? `<p>${pointsLine}</p>` : ""}
  `;

  const text = [
    "Il rinnovo della tua membership Obaldi e avvenuto con successo.",
    `Piano: ${planLabel}`,
    `Nuova scadenza: ${endDate}`,
    pointsLine
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: "Rinnovo membership Obaldi",
    html,
    text
  };
};

export const renderOrderShipped = (params: {
  orderId: string;
  carrier: string | null;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippedAt: Date;
}) => {
  const orderUrl = `${getAppBaseUrl()}/orders/${params.orderId}`;

  const trackingHtml = params.trackingCode
    ? `<p>Corriere: ${escapeHtml(params.carrier || "Non specificato")}</p>
       <p>Tracking Code: <strong>${escapeHtml(params.trackingCode)}</strong></p>
       ${params.trackingUrl ? `<p><a href="${params.trackingUrl}">Segui la spedizione</a></p>` : ""}`
    : `<p>La spedizione è partita.</p>`;

  const html = `
    <p>Ciao,</p>
    <p>Il tuo ordine è stato spedito!</p>
    <p>Ordine: ${escapeHtml(params.orderId)}</p>
    ${trackingHtml}
    <p>Puoi seguire i dettagli qui: <a href="${orderUrl}">${orderUrl}</a></p>
  `;

  const text = [
    "Il tuo ordine è stato spedito!",
    `Ordine: ${params.orderId}`,
    params.carrier ? `Corriere: ${params.carrier}` : "",
    params.trackingCode ? `Tracking Code: ${params.trackingCode}` : "",
    params.trackingUrl ? `Link Tracking: ${params.trackingUrl}` : "",
    `Dettagli: ${orderUrl}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Il tuo ordine ${params.orderId.slice(0, 8)} è stato spedito!`,
    html,
    text
  };
};

export const renderOrderDelivered = (params: {
  orderId: string;
  deliveredAt: Date;
}) => {
  const orderUrl = `${getAppBaseUrl()}/orders/${params.orderId}`;
  const reviewUrl = `${getAppBaseUrl()}/product/REVIEW-LINK-PLACEHOLDER`; // Ideally link to products to review

  const html = `
    <p>Ciao,</p>
    <p>Il tuo ordine è stato consegnato.</p>
    <p>Ordine: ${escapeHtml(params.orderId)}</p>
    <p>Speriamo che i prodotti siano di tuo gradimento.</p>
    <p><a href="${orderUrl}">Lascia una recensione</a></p>
  `;

  const text = [
    "Il tuo ordine è stato consegnato.",
    `Ordine: ${params.orderId}`,
    "Speriamo che i prodotti siano di tuo gradimento.",
    `Lascia una recensione: ${orderUrl}`
  ].join("\n");

  return {
    subject: `Il tuo ordine ${params.orderId.slice(0, 8)} è stato consegnato!`,
    html,
    text
  };
};
