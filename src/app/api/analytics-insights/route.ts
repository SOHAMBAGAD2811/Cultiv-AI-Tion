import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.GOOGLE_API_KEY;

if (!geminiApiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Simple in-memory cache to avoid repeated Gemini calls for identical analytics payloads
const INSIGHTS_CACHE: Map<string, { value: any; expires: number }> = new Map();
const INSIGHTS_TTL_MS = 1000 * 60 * 30; // 30 minutes

interface AnalyticsInsightRequest {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  inventoryCount: number;
  salesCount: number;
  expensesCount: number;
  topCrops?: string[];
  topExpenseCategories?: string[];
  location?: string;
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  try {
    const body: AnalyticsInsightRequest = await request.json();
    console.log('Analytics request received:', body);

    const cacheKey = JSON.stringify(body);
    const now = Date.now();
    const cached = INSIGHTS_CACHE.get(cacheKey);
    if (cached && cached.expires > now) {
      console.log('[api/analytics-insights] Returning cached insights (fast-path)');
      return NextResponse.json(cached.value);
    }

    const {
      totalRevenue,
      totalExpenses,
      netProfit,
      inventoryCount,
      salesCount,
      expensesCount,
      topCrops,
      topExpenseCategories,
      location,
    } = body;

    // Create a detailed prompt for Gemini
    const prompt = `You are an agricultural business analyst. Based on the following farm analytics data${location ? ` for a farm located in ${location}` : ""}, provide:
1. A brief summary (2-3 sentences) of the current farm business status
2. 3-4 specific actionable recommendations to improve profitability${location ? `, including specific crop suggestions and harvesting techniques suitable for the ${location} region` : ""}
3. Any potential issues or concerns to address

Analytics Data:
${location ? `- Location: ${location}` : ""}
- Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}
- Total Expenses: ₹${totalExpenses.toLocaleString("en-IN")}
- Net Profit: ₹${netProfit.toLocaleString("en-IN")}
- Profit Margin: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%
- Inventory Records: ${inventoryCount}
- Sales Records: ${salesCount}
- Expense Records: ${expensesCount}
${topCrops && topCrops.length > 0 ? `- Top Crops: ${topCrops.join(", ")}` : ""}
${
  topExpenseCategories && topExpenseCategories.length > 0
    ? `- Major Expense Categories: ${topExpenseCategories.join(", ")}`
    : ""
}

Please format your response as:
SUMMARY:
[Your 2-3 sentence summary]

RECOMMENDATIONS:
1. [First recommendation]
2. [Second recommendation]
3. [Third recommendation]
4. [Fourth recommendation]

CONCERNS:
[Any potential issues or areas of concern]

Keep the response practical, specific to farming, and actionable. Do not use markdown formatting (like **bold**) in the output.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response
    const summaryMatch = responseText.match(/SUMMARY:\s*\n([\s\S]*?)(?=\n\nRECOMMENDATIONS:|$)/);
    const recommendationsMatch = responseText.match(
      /RECOMMENDATIONS:\s*\n([\s\S]*?)(?=\n\nCONCERNS:|$)/
    );
    const concernsMatch = responseText.match(/CONCERNS:\s*\n([\s\S]*?)$/);

    const summary = summaryMatch ? summaryMatch[1].trim().replace(/\*\*/g, '') : "";
    const recommendationsText = recommendationsMatch
      ? recommendationsMatch[1].trim()
      : "";
    const concerns = concernsMatch ? concernsMatch[1].trim().replace(/\*\*/g, '') : "";

    // Parse recommendations into array
    const recommendations = recommendationsText
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, "").replace(/\*\*/g, "").trim());

    return NextResponse.json({
      summary,
      recommendations,
      concerns,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      healthStatus:
        netProfit > 0
          ? totalExpenses > totalRevenue * 0.7
            ? "warning"
            : "good"
          : "critical",
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  } finally {
    console.log('[api/analytics-insights] Request handled in', Date.now() - start, 'ms');
  }
}
