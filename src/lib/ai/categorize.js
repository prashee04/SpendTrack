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

export async function categorizeTransaction(description) {
    const openai = getClient();
    if (!openai) return "Other";

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
        return CATEGORIES.includes(result) ? result : "Other";
    } catch (error) {
        console.error("AI categorize error:", error);
        return "Other";
    }
}

export { CATEGORIES };
