export const CURRENCIES = {
    INR: { symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
    USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
    EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
    GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
};

export function formatCurrency(value, currency = "INR", options = {}) {
    const config = CURRENCIES[currency] || CURRENCIES.INR;
    const num = Number(value) || 0;

    const isWhole = num % 1 === 0;
    const minDigits = options.showDecimals ? 2 : (options.compact || isWhole ? 0 : 2);
    const maxDigits = options.compact ? 0 : 2;

    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
        notation: options.compact ? "compact" : "standard",
    }).format(num);
}
