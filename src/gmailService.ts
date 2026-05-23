import { Transaction } from "./types";

/**
 * Decodes Gmail base64url format string safely
 */
function decodeBase64Url(str: string): string {
  try {
    // Replace URL-safe base64 characters
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // Pad base64 representation if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    // Handle unicode safely
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error("Failed to decode base64url content:", error);
    return "";
  }
}

/**
 * Recursively parses the Gmail message body parts to find readable text content
 */
function getMessageBody(payload: any): string {
  if (!payload) return "";
  
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      const body = getMessageBody(part);
      if (body) return body;
    }
  }
  
  return payload.snippet || "";
}

/**
 * Synchronizes financial transactional emails from the user's logged-in Gmail account
 */
export async function fetchAndSyncGmailTransactions(
  accessToken: string,
  onProgress?: (progress: string) => void
): Promise<Transaction[]> {
  try {
    if (onProgress) onProgress("Searching Gmail for transaction alerts...");

    // Optimized search query looking for transaction receipts, debit/credit notices, spent alerts, including UPI and Indian banks
    const query = encodeURIComponent(
      'after:2025/01/01 (subject:"transaction" OR subject:"charge" OR subject:"payment" OR subject:"receipt" OR subject:"spent" OR subject:"purchase" OR subject:"debit" OR subject:"alert" OR subject:"debited" OR subject:"credited" OR subject:"UPI" OR "authorized" OR "debited" OR "credited" OR "UPI" OR "spent ₹" OR "HDFC" OR "ICICI" OR "SBI" OR "AXIS" OR "Paytm" OR "PhonePe" OR "GPay")'
    );
    
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${query}`;
    
    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!listResponse.ok) {
      const errText = await listResponse.text();
      throw new Error(`Gmail API List failed: ${listResponse.statusText}. ${errText}`);
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      if (onProgress) onProgress("No matching transaction emails found in Gmail.");
      return [];
    }

    const parsedTransactions: Transaction[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msgInfo = messages[i];
      if (onProgress) {
        onProgress(`Syncing message ${i + 1} of ${messages.length}...`);
      }

      // Fetch message details
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgInfo.id}`;
      const detailRes = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!detailRes.ok) {
        console.warn(`Could not fetch details for message: ${msgInfo.id}`);
        continue;
      }

      const messageDetails = await detailRes.json();
      
      // Extract Subject
      const headers = messageDetails.payload?.headers || [];
      const subjectHeader = headers.find((h: any) => h.name === "Subject" || h.name === "subject");
      const subject = subjectHeader ? subjectHeader.value : "Financial Notification";
      
      const bodyText = getMessageBody(messageDetails.payload);

      // Call secure server-side Gemini parsing API to extract structured fields safely
      const parseRes = await fetch("/api/parse-transaction-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          bodyText: bodyText.substring(0, 3000), // Trim body to stay within context size
        }),
      });

      if (!parseRes.ok) {
        console.error(`AI Model parsing failed for message: ${msgInfo.id}`);
        continue;
      }

      const parsedJson = await parseRes.json();
      
      if (parsedJson.isTransaction && parsedJson.amount > 0) {
        const trans: Transaction = {
          id: `gmail-${msgInfo.id}`,
          merchant: parsedJson.merchant || "Standard Merchant",
          amount: parsedJson.amount,
          date: parsedJson.date || new Date().toISOString().split("T")[0],
          category: parsedJson.category || "General/Other",
          cardLast4: parsedJson.cardLast4 || "####",
          source: "gmail",
          status: "synced",
          currency: parsedJson.currency || "INR",
          emailId: msgInfo.id,
        };
        parsedTransactions.push(trans);
      }
    }

    return parsedTransactions;
  } catch (error) {
    console.error("Gmail sync failed:", error);
    throw error;
  }
}
