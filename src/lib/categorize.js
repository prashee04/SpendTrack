import OpenAI from "openai";

const CATEGORIES = [
    "Food",
    "Transport",
    "Bills",
    "Shopping",
    "Health",
    "Entertainment",
    "Salary",
    "Investment",
    "Other",
];

let client = null;

function getClient() {
    if (!process.env.OPENAI_API_KEY) return null;
    if (!client) {
        client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return client;
}

/** Local keyword-based fallback used when AI is unavailable or offline. */
function localCategorize(description = "") {
    const d = description.toLowerCase();
    if (/(swiggy|zomato|restaurant|cafe|pizza|food|lunch|dinner|grocer)/.test(d)) return "Food";
    if (/(uber|ola|cab|taxi|fuel|petrol|diesel|metro|bus|train|flight)/.test(d)) return "Transport";
    if (/(electricity|water|gas|bill|airtel|jio|broadband|recharge|utility)/.test(d)) return "Bills";
    if (/(amazon|flipkart|myntra|shopping|mall|store)/.test(d)) return "Shopping";
    if (/(hospital|pharmacy|clinic|doctor|medicine|health)/.test(d)) return "Health";
    if (/(netflix|spotify|movie|bookmyshow|game|entertain)/.test(d)) return "Entertainment";
    if (/(salary|payroll|wages|stipend)/.test(d)) return "Salary";
    if (/(sip|mutual|stock|zerodha|groww|invest|fd|rd)/.test(d)) return "Investment";
    return "Other";
}

export async function categorizeTransaction(description) {
    const openai = getClient();
    if (!openai) return localCategorize(description);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content:
                        "You are a finance categorization engine. Return exactly one category from this list: " +
                        CATEGORIES.join(", ") +
                        ". Return only the category name.",
                },
                { role: "user", content: description },
            ],
        });

        const result = completion.choices[0]?.message?.content?.trim();
        return CATEGORIES.includes(result) ? result : localCategorize(description);
    } catch (error) {
        console.error("AI categorize error:", error);
        return localCategorize(description);
    }
}

export { CATEGORIES };
