import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Klue API Core",
    version: "2.0.0",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Smart Reply generator for cross-platform messages
app.post("/api/ai/smart-reply", async (req: Request, res: Response) => {
  try {
    const { platform, sender, content, context, tone = "korean_minimal" } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing message content" });
    }

    const ai = getGeminiClient();

    const tonePrompts: Record<string, string> = {
      korean_minimal: "韓系極簡與俐落 (俐落、有質感、禮貌而克制、語氣溫柔精準)",
      professional: "專業商務與高效率 (明快、具行動力、結構清晰)",
      friendly: "親切熱情與社交感 (自然、溫暖、善用適量表情符號)",
      humorous: "風趣幽默與破冰感 (機智、生動、吸引眼球)",
    };

    const toneDescription = tonePrompts[tone] || tonePrompts.korean_minimal;

    const prompt = `你現在是 Klue 智慧社交樞紐的跨平台 AI 訊息助理。
請針對以下來自 [${platform || "社群平台"}] 的訊息，生成 3 種不同長度或風格的即時回覆選項（短回覆、完整回覆、反問推進）。

【來源平台】：${platform}
【發送者】：${sender || "用戶"}
【訊息內容】：
"${content}"
${context ? `【上下文資訊】：${context}` : ""}

【回覆目標風格】：${toneDescription}
【語言要求】：繁體中文為主，自然融合符合該平台文化（如 Discord 靈活、Gmail 專業、IG/TikTok 網感）。

請輸出 JSON 格式：
{
  "replies": [
    {
      "type": "quick",
      "label": "⚡ 俐落短覆",
      "text": "回覆內容..."
    },
    {
      "type": "detailed",
      "label": "✨ 完整細緻",
      "text": "回覆內容..."
    },
    {
      "type": "proactive",
      "label": "💬 互動推進",
      "text": "回覆內容..."
    }
  ],
  "intentAnalysis": "這則訊息的核心意圖一句話總結",
  "recommendedAction": "建議的後續行動"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      res.json({ success: true, data: parsed });
    } catch {
      res.json({
        success: true,
        data: {
          replies: [
            { type: "quick", label: "⚡ 俐落短覆", text: "已收到，稍後為您處理！" },
            { type: "detailed", label: "✨ 完整細緻", text: "謝謝你的訊息，目前正在檢視相關進度，稍後會同步最新狀況給你。" },
            { type: "proactive", label: "💬 互動推進", text: "收到！請問是否有需要特別優先關注的細節呢？" },
          ],
          intentAnalysis: "一般社群與工作訊息",
          recommendedAction: "及時回覆以保持良好互動率",
        },
      });
    }
  } catch (error: any) {
    console.error("Smart reply error:", error);
    res.status(500).json({ error: error.message || "Failed to generate smart reply" });
  }
});

// 2. AI Smart Message Classifier & Spam Filter
app.post("/api/ai/classify-message", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const ai = getGeminiClient();
    const prompt = `請分析以下這批跨平台訊息，為每一則判定分類 category (可選: "urgent" [緊急重要], "social" [親友社交/私訊], "notification" [系統/安全通知], "subscription" [訂閱動態/電子報/促銷])，並給出 0-100 的垃圾/釣魚危險指數 spamRisk，以及 15 字以內的 AI 核心速記 summary：

訊息清單：
${JSON.stringify(messages.slice(0, 8), null, 2)}

請回傳 JSON 陣列，每個項目對應原 message id：
[
  {
    "id": "訊息ID",
    "category": "urgent | social | notification | subscription",
    "priorityScore": 90, // 0-100
    "spamRisk": 5, // 0-100
    "isSpam": false,
    "summary": "快速摘要"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({ error: error.message || "Failed to classify messages" });
  }
});

// 3. AI Personal Social Data & Identity Analysis (個人數位畫像與跨平台趨勢報告)
app.post("/api/ai/social-report", async (req: Request, res: Response) => {
  try {
    const { profile, metrics, connectedPlatforms } = req.body;
    const ai = getGeminiClient();

    const prompt = `你現在是 Klue 核心的跨平台社群智慧引擎 (Klue Social Intelligence Engine)。
請為用戶綜合分析其全平台數據軌跡（包含 Spotify 音樂氛圍、TikTok/Instagram 互動與受眾成長、YouTube 觀看偏好、Discord 活躍時段、Gmail 處理效率），生成一份極具韓系現代美學質感的「Klue 個人數位標籤與趨勢報告 (Social Identity Dossier)」。

【用戶基本資料】：
- 名稱: ${profile?.name || "Klue 體驗用戶"}
- Klue Passport ID: ${profile?.handle || "@user.klue"}
- 已連動平台: ${(connectedPlatforms || ["Spotify", "Instagram", "Discord", "YouTube", "Gmail", "TikTok"]).join(", ")}
- 平台指標數據概要: ${JSON.stringify(metrics || {})}

請以富有洞察力、高級感且溫潤激勵的語氣，生成繁體中文分析，並格式化為嚴格的 JSON：
{
  "digitalArchetype": "數位人格原型 (例如：極光策展人 Cyber Curator / 夜行靈感漫遊者 / 超維度連接者)",
  "vibeAura": "靈感光譜名稱 (例如：霧灰紫與冷光銀 / 晶透曜黑 / 琉璃青)",
  "auraGradient": "兩組十六進位色碼 (如 ['#7c5cff', '#38bdf8'])",
  "coreTagline": "專屬個人社群引言 (15-25 字)",
  "digitalTags": ["#標籤1", "#標籤2", "#標籤3", "#標籤4", "#標籤5"],
  "radarMetrics": [
    { "subject": "創造力指數", "value": 88, "fullMark": 100 },
    { "subject": "社交共鳴度", "value": 92, "fullMark": 100 },
    { "subject": "資訊處理敏捷", "value": 85, "fullMark": 100 },
    { "subject": "音樂品味深度", "value": 95, "fullMark": 100 },
    { "subject": "跨平台連結度", "value": 90, "fullMark": 100 }
  ],
  "platformInsights": [
    {
      "platform": "Spotify",
      "highlight": "最能代表當前狀態的聽覺軌跡",
      "detail": "細節洞察（如常在深夜聆聽 Ambient/K-Indie，展現高沉浸專注力）"
    },
    {
      "platform": "Instagram & TikTok",
      "highlight": "視覺社群活躍度與視覺影響力",
      "detail": "互動率與內容共鳴分析"
    },
    {
      "platform": "YouTube",
      "highlight": "知識攝取與視野延展",
      "detail": "深度長影音與科技設計頻道的長駐探索"
    },
    {
      "platform": "Discord & Gmail",
      "highlight": "即時協作與重要訊號捕捉",
      "detail": "平均回覆節奏與社群貢獻熱度"
    }
  ],
  "weeklySummary": "本週跨平台動態總體評析（80-120字，精闢分析）",
  "smartRecommendations": [
    "優化建議 1 (針對跨平台影響力)",
    "優化建議 2 (針對資訊健康與注意力管理)",
    "優化建議 3 (下週社群連結突破口)"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Social report error:", error);
    res.status(500).json({ error: error.message || "Failed to generate social report" });
  }
});

// 4. AI Cross-Post Optimizer (一鍵全平台貼文適配)
app.post("/api/ai/cross-post-optimize", async (req: Request, res: Response) => {
  try {
    const { draftText, mediaType = "text_image", targetPlatforms = ["instagram", "discord", "youtube", "tiktok", "facebook"] } = req.body;
    if (!draftText) {
      return res.status(400).json({ error: "Missing draft text" });
    }

    const ai = getGeminiClient();
    const prompt = `請將用戶輸入的這段想法/貼文草稿，自動優化改寫成適配多個社群平台（Instagram, Discord, YouTube Community, TikTok, Facebook）的最佳格式與排版，並提取最合適的 Hashtags：

【原始草稿】：
"${draftText}"

【媒體類型】：${mediaType}
【目標平台】：${targetPlatforms.join(", ")}

請輸出 JSON 格式：
{
  "optimizedPosts": {
    "instagram": {
      "text": "IG 格式貼文（韓系簡約空行、生動排版）",
      "hashtags": ["#Klue", "#Aesthetic", "..."],
      "tip": "建議搭配 4:5 直式微光濾鏡圖"
    },
    "discord": {
      "text": "Discord 格式貼文（Markdown 粗體、清單、強調語氣）",
      "hashtags": [],
      "tip": "建議發布於 #announcements 或 #general 頻道"
    },
    "youtube": {
      "text": "YouTube 社群貼文/Short 說明欄格式",
      "hashtags": ["#Shorts", "..."],
      "tip": "結尾附上投票或置頂提問以提升留言率"
    },
    "tiktok": {
      "text": "TikTok 緊湊吸睛文案",
      "hashtags": ["#fyp", "#trending", "..."],
      "tip": "前 3 秒開頭需建立懸念"
    },
    "facebook": {
      "text": "Facebook 敘事感強烈的完整貼文",
      "hashtags": [],
      "tip": "適合附上外部連結或討論話題"
    }
  },
  "viralScore": 88,
  "summary": "這篇貼文在各平台的核心轉換點"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Cross-post error:", error);
    res.status(500).json({ error: error.message || "Failed to optimize cross post" });
  }
});

// 5. AI Inbox Executive Digest (跨平台未讀智慧摘要)
app.post("/api/ai/inbox-digest", async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    const ai = getGeminiClient();

    const prompt = `請為以下這批跨平台的未讀訊息與通知，生成一份「Klue 晨報式/晨間智慧速報」：
包含：
1. 3 句關鍵簡報 (Key Highlights)
2. 需立即處理的緊急事項 (Urgent Action Items)
3. 社交問候與溫馨提醒 (Social & Chill Updates)

未讀清單：
${JSON.stringify(items || [], null, 2)}

請以精鍊高質感的繁體中文輸出 JSON：
{
  "headline": "晨間社群速報標題",
  "readTimeMinutes": 1,
  "highlights": ["重點 1", "重點 2", "重點 3"],
  "urgentCount": 2,
  "urgentItems": [
    { "platform": "Gmail", "title": "...", "action": "建議回覆" }
  ],
  "socialUpdate": "朋友與社群主要動態總結",
  "encouragement": "一句啟發一天的俐落引言"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Inbox digest error:", error);
    res.status(500).json({ error: error.message || "Failed to generate inbox digest" });
  }
});

// Vite Middleware for development / Static files for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Klue Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start Klue server:", err);
});
