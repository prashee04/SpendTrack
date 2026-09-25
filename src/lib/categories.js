export const DEFAULT_CATEGORIES = [
    { id: "cat_food", name: "Food & Dining", icon: "🍔", type: "EXPENSE" },
    { id: "cat_transport", name: "Transport & Fuel", icon: "🚗", type: "EXPENSE" },
    { id: "cat_bills", name: "Bills & Utilities", icon: "💡", type: "EXPENSE" },
    { id: "cat_shopping", name: "Shopping", icon: "🛍️", type: "EXPENSE" },
    { id: "cat_health", name: "Healthcare", icon: "🏥", type: "EXPENSE" },
    { id: "cat_entertainment", name: "Entertainment", icon: "🎬", type: "EXPENSE" },
    { id: "cat_other_exp", name: "Other Expense", icon: "📦", type: "EXPENSE" },
    { id: "cat_allowance", name: "Allowance", icon: "💵", type: "INCOME" },
    { id: "cat_salary", name: "Salary", icon: "💼", type: "INCOME" },
    { id: "cat_petty_cash", name: "Petty Cash", icon: "💵", type: "INCOME" },
    { id: "cat_bonus", name: "Bonus", icon: "🎁", type: "INCOME" },
    { id: "cat_others", name: "Others", icon: "📦", type: "INCOME" },
];

export function resolveCategory(catId, customCategories = [], txType = "EXPENSE") {
    if (txType === "TRANSFER") {
        return { id: "cat_transfer", name: "Transfer", icon: "🔄", type: "TRANSFER" };
    }
    if (!catId) {
        return { id: "cat_general", name: "General", icon: "📦", type: txType };
    }

    const catIdStr = String(catId).toLowerCase();

    const foundCustom = (customCategories || []).find(
        (c) =>
            (c.id && String(c.id).toLowerCase() === catIdStr) ||
            (c._id && String(c._id).toLowerCase() === catIdStr) ||
            (c.name && c.name.toLowerCase() === catIdStr)
    );
    if (foundCustom) return foundCustom;

    const foundDefault = DEFAULT_CATEGORIES.find(
        (c) => c.id.toLowerCase() === catIdStr || c.name.toLowerCase() === catIdStr
    );
    if (foundDefault) return foundDefault;

    return { id: catId, name: String(catId), icon: "🏷️", type: txType };
}

