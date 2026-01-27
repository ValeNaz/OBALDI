export const formatCurrency = (cents: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: currency,
    }).format(cents / 100);
};

export const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
