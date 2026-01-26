import { prisma } from "@/src/core/db";

type NotificationType =
    | "ORDER_CREATED"
    | "ORDER_PAID"
    | "ORDER_SHIPPED"
    | "ORDER_DELIVERED"
    | "PRODUCT_APPROVED"
    | "PRODUCT_REJECTED"
    | "POINTS_EARNED"
    | "MEMBERSHIP_RENEWED"
    | "SYSTEM";

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
            },
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}

// Helper functions for common notification types
export async function notifyOrderCreated(userId: string, orderId: string) {
    return createNotification({
        userId,
        type: "ORDER_CREATED",
        title: "Ordine creato",
        message: "Il tuo ordine è stato creato con successo. Ti terremo aggiornato sullo stato.",
        link: `/orders/${orderId}`,
    });
}

export async function notifyOrderPaid(userId: string, orderId: string) {
    return createNotification({
        userId,
        type: "ORDER_PAID",
        title: "Pagamento confermato",
        message: "Il pagamento del tuo ordine è stato confermato. La spedizione partirà a breve.",
        link: `/orders/${orderId}`,
    });
}

export async function notifyOrderShipped(userId: string, orderId: string) {
    return createNotification({
        userId,
        type: "ORDER_SHIPPED",
        title: "Ordine spedito",
        message: "Il tuo ordine è stato spedito! Controlla lo stato della consegna.",
        link: `/orders/${orderId}`,
    });
}

export async function notifyOrderDelivered(userId: string, orderId: string) {
    return createNotification({
        userId,
        type: "ORDER_DELIVERED",
        title: "Ordine consegnato",
        message: "Il tuo ordine è stato consegnato. Grazie per aver acquistato su Obaldi!",
        link: `/orders/${orderId}`,
    });
}

export async function notifyProductApproved(userId: string, productId: string, productTitle: string) {
    return createNotification({
        userId,
        type: "PRODUCT_APPROVED",
        title: "Prodotto approvato",
        message: `Il tuo prodotto "${productTitle}" è stato approvato ed è ora visibile nel marketplace.`,
        link: `/product/${productId}`,
    });
}

export async function notifyProductRejected(userId: string, productTitle: string, reason?: string) {
    return createNotification({
        userId,
        type: "PRODUCT_REJECTED",
        title: "Prodotto non approvato",
        message: `Il tuo prodotto "${productTitle}" non è stato approvato.${reason ? ` Motivo: ${reason}` : ""}`,
        link: `/seller`,
    });
}

export async function notifyPointsEarned(userId: string, points: number, reason: string) {
    return createNotification({
        userId,
        type: "POINTS_EARNED",
        title: `Hai guadagnato ${points} punti!`,
        message: reason,
        link: `/profile`,
    });
}

export async function notifyMembershipRenewed(userId: string) {
    return createNotification({
        userId,
        type: "MEMBERSHIP_RENEWED",
        title: "Abbonamento rinnovato",
        message: "Il tuo abbonamento Premium è stato rinnovato con successo.",
        link: `/billing`,
    });
}

export async function notifySubscriptionCanceled(userId: string, endDate?: Date) {
    return createNotification({
        userId,
        type: "SYSTEM",
        title: "Abbonamento cancellato",
        message: endDate
            ? `Il tuo abbonamento è terminato. Ultimo giorno attivo: ${endDate.toLocaleDateString("it-IT")}.`
            : "Il tuo abbonamento è stato cancellato.",
        link: `/membership`,
    });
}

export async function notifyPlanChanged(userId: string, oldPlan: string, newPlan: string) {
    const isUpgrade = newPlan === "TUTELA";
    return createNotification({
        userId,
        type: "MEMBERSHIP_RENEWED",
        title: isUpgrade ? "Upgrade completato!" : "Piano modificato",
        message: isUpgrade
            ? `Hai effettuato l'upgrade da ${oldPlan} a ${newPlan}. Goditi tutti i nuovi vantaggi!`
            : `Sei passato dal piano ${oldPlan} al piano ${newPlan}.`,
        link: `/billing`,
    });
}

export async function notifyPaymentFailed(userId: string) {
    return createNotification({
        userId,
        type: "SYSTEM",
        title: "Pagamento non riuscito",
        message: "Non siamo riusciti a processare il pagamento del tuo abbonamento. Aggiorna il metodo di pagamento.",
        link: `/billing`,
    });
}

