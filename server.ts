import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily
let aiClient: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in settings. Please define your GEMINI_API_KEY in the Secrets panel in the AI Studio UI.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to parse transactions directly from email content (Subject + Body)
app.post("/api/parse-transaction-email", async (req, res) => {
  const { subject, bodyText } = req.body;

  if (!subject && !bodyText) {
    return res.status(400).json({ error: "Subject or bodyText is required" });
  }

  try {
    const ai = getAI();
    const prompt = `
      Analyze the following email subject and body text to detect if this is a bank / UPI / credit card / debit card / Paytm / GPay / PhonePe / financial transaction alert, invoice, charge, spent notice, or receipt.
      
      We are focusing on Indian banking networks (HDFC, ICICI, SBI, Axis, HSBC, etc.) and global alerts.
      These alerts frequently contain:
      - UPI transaction updates like "Rs. 250 spent", "UPI Ref No", "debited from A/c", "credited", "VPA", "payee name".
      - "debited/credited Rs. XXXX at XXXX merchant".
      - "has been debited by Rs. XXXX" or "spent ₹XXXX".
      
      If it is NOT a transaction or payment alert, indicate isTransaction: false.
      
      If it IS a transaction, extract:
      1. Merchant: Name of payee, vendor (e.g., Swiggy, Uber, DMart, Amazon India, Netflix).
      2. Amount: The numeric currency amount (e.g., if Rs 1,450 or ₹1450, return 1450.00). If in dollars, return the numeric value as is (e.g. 50.00).
      3. Currency: Always returns the currency code (e.g. INR, USD, EUR).
      4. Date: ISO format date (YYYY-MM-DD). If no clear year is found, default to 2026.
      5. Category: Assign to one of [Food & Dining, Shopping, Travel, Entertainment, Utilities, Groceries, Income, General/Other].
      6. CardLast4: The last 4 digits of the card or account mentioned in the alert, if discernible (e.g., if card XX0951 debited, return "0951").
      
      Email Subject: ${subject || ""}
      Email Body:
      ${bodyText || ""}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["isTransaction"],
          properties: {
            isTransaction: {
              type: Type.BOOLEAN,
              description: "Whether this email represents a concrete financial transaction, receipt, or alert."
            },
            merchant: {
              type: Type.STRING,
              description: "Name of the merchant, store, or service."
            },
            amount: {
              type: Type.NUMBER,
              description: "The absolute numeric transaction value."
            },
            currency: {
              type: Type.STRING,
              description: "The currency code, e.g. INR or USD."
            },
            date: {
              type: Type.STRING,
              description: "The ISO date YYYY-MM-DD format of the transaction."
            },
            category: {
              type: Type.STRING,
              description: "The best categorized bucket: Food & Dining, Shopping, Travel, Entertainment, Utilities, Groceries, Income, General/Other."
            },
            cardLast4: {
              type: Type.STRING,
              description: "Last 4 digits of the card, bank, or mobile account. Mock or empty string if not found."
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Accuracy confidence parameter."
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error parsing email with Gemini:", error);
    res.status(500).json({ 
      error: "Failed to analyze transaction email", 
      details: error.message || error 
    });
  }
});

// API endpoint to categorize a single transaction merchant name/description
app.post("/api/ai-categorize", async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Transaction description is required" });
  }

  try {
    const ai = getAI();
    const prompt = `
      Categorize the following transaction description/merchant: "${description}".
      Select the best matching financial category from this list:
      [Food & Dining, Shopping, Travel, Entertainment, Utilities, Groceries, Income, General/Other].
      Provide a brief justification of why it fits this category.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["category", "justification"],
          properties: {
            category: {
              type: Type.STRING,
              description: "The selected category from the allowed set."
            },
            justification: {
              type: Type.STRING,
              description: "Short reason for matching."
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("AI Categorization error:", error);
    res.status(500).json({ 
      error: "Failed to categorize transaction description", 
      details: error.message || error 
    });
  }
});

// Start dev server middleware or serve production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
