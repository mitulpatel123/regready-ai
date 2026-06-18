const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(
      REPORTS_FILE,
      JSON.stringify({ reports: [], feedback: [] }, null, 2)
    );
  }
}

function readStorage() {
  ensureStorage();
  try {
    const raw = fs.readFileSync(REPORTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : []
    };
  } catch (error) {
    return { reports: [], feedback: [] };
  }
}

function writeStorage(data) {
  ensureStorage();
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(data, null, 2));
}

function normalizeAnswer(value) {
  return String(value || "").trim().toLowerCase();
}

function calculateScore(formData) {
  let score = 80;
  const hasPolicy = normalizeAnswer(formData.hasWrittenPolicy) === "yes";

  if (normalizeAnswer(formData.customerData) === "yes") score -= 15;
  if (normalizeAnswer(formData.publicAiTools) === "yes" && !hasPolicy) score -= 15;
  if (normalizeAnswer(formData.hrDecisions) === "yes") score -= 15;
  if (
    normalizeAnswer(formData.customerFacingContent) === "yes" &&
    normalizeAnswer(formData.disclosesAi) !== "yes"
  ) {
    score -= 10;
  }
  if (normalizeAnswer(formData.thirdPartyVendors) === "yes") score -= 10;

  const concern = normalizeAnswer(formData.biggestConcern);
  if (["privacy", "legal uncertainty", "data security"].includes(concern)) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function getRiskLevel(score) {
  if (score <= 39) return "High Risk";
  if (score <= 69) return "Moderate Risk";
  return "Low Risk";
}

function validateIntake(formData) {
  const errors = [];
  const requiredFields = [
    "businessName",
    "businessType",
    "businessSize",
    "customerData",
    "publicAiTools",
    "hrDecisions",
    "customerFacingContent",
    "disclosesAi",
    "thirdPartyVendors",
    "hasWrittenPolicy",
    "biggestConcern"
  ];

  requiredFields.forEach((field) => {
    if (!formData[field] || String(formData[field]).trim() === "") {
      errors.push(`${field} is required.`);
    }
  });

  if (!Array.isArray(formData.aiUses) || formData.aiUses.length === 0) {
    errors.push("At least one AI use must be selected.");
  }

  return errors;
}

function buildPrompt(formData, score, riskLevel) {
  const aiUses = formData.aiUses.join(", ");

  return `
You are RegReady AI, an educational AI compliance readiness assistant for small businesses.

Important safety rules:
- Do not claim to provide legal advice.
- Use cautious, practical wording.
- Tell users to seek professional review for legal, healthcare, employment, financial, safety, and compliance decisions.
- Do not invent specific laws unless location and context are provided.
- Keep the report useful for a small-business owner.

Business intake:
- Business Name: ${formData.businessName}
- Business Type: ${formData.businessType}
- Business Size: ${formData.businessSize}
- Current AI Uses: ${aiUses}
- Customer personal data entered into AI tools: ${formData.customerData}
- Employees use public AI tools: ${formData.publicAiTools}
- AI used for hiring, screening, employee evaluation, or HR decisions: ${formData.hrDecisions}
- AI used to create customer-facing content: ${formData.customerFacingContent}
- AI-assisted content or communication disclosed to customers: ${formData.disclosesAi}
- Third-party AI vendors or AI features in software: ${formData.thirdPartyVendors}
- Written AI-use policy: ${formData.hasWrittenPolicy}
- Biggest concern: ${formData.biggestConcern}
- Additional notes: ${formData.additionalNotes || "None provided"}

Internal scoring result:
- Overall Readiness Score: ${score}/100
- Risk Level: ${riskLevel}

Generate a clear, professional compliance readiness report with headings and bullet points.
The report must include these sections exactly and in this order:

REGREADY AI COMPLIANCE READINESS REPORT

1. Business Snapshot
Summarize the business type, size, and AI-use areas.

2. Overall Readiness Score
State the score from 0 to 100 and the risk level. Briefly explain why.

3. Top Risk Areas
Identify 3-5 top risks from: Privacy, Bias / fairness, Copyright, Disclosure / transparency, Vendor risk, Employee misuse, Data security, Customer trust, Legal uncertainty.

4. AI Use Policy Draft
Write a short practical AI-use policy for employees.

5. Employee Guidance
List do's and don'ts for employees using AI.

6. Customer Disclosure Language
Provide simple customer-facing disclosure wording.

7. Vendor-Risk Checklist
List questions the business should ask AI vendors.

8. Recommended Next Steps
Give 5 practical next steps.

9. Human Review Notice
State that legal, financial, HR, healthcare, safety, and compliance-related AI outputs should be reviewed by a qualified human.

10. Disclaimer
State that this report is educational and not legal advice.
`.trim();
}

function getGeminiModelsToTry() {
  const configured = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const fallbackModels = [
    configured,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-lite-latest"
  ];

  return [...new Set(fallbackModels)]
    .filter(Boolean)
    .map((model) => model.replace(/^models\//, ""));
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment.");
  }

  let lastError = null;

  for (const model of getGeminiModelsToTry()) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.35,
            topP: 0.9,
            maxOutputTokens: 3200
          }
        })
      });

      const body = await response.json();
      if (!response.ok) {
        const message = body.error?.message || "Gemini API request failed.";
        throw new Error(`${model}: ${message}`);
      }

      const text = body.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

      if (!text) {
        throw new Error(`${model}: Gemini returned an empty report.`);
      }

      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Gemini API request failed.");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "RegReady AI" });
});

app.post("/api/generate-report", async (req, res) => {
  const formData = req.body || {};
  const errors = validateIntake(formData);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Please complete the required intake fields.",
      errors
    });
  }

  const score = calculateScore(formData);
  const riskLevel = getRiskLevel(score);
  const createdAt = new Date().toISOString();
  const prompt = buildPrompt(formData, score, riskLevel);

  try {
    const report = await callGemini(prompt);
    const storage = readStorage();
    const reportRecord = {
      id: `report_${Date.now()}`,
      businessName: formData.businessName,
      businessType: formData.businessType,
      score,
      riskLevel,
      report,
      createdAt
    };

    storage.reports.push(reportRecord);
    writeStorage(storage);

    res.json({
      success: true,
      report,
      score,
      riskLevel,
      createdAt
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message:
        "The AI service could not generate a report right now. Check your Gemini API key and try again.",
      detail: error.message
    });
  }
});

app.post("/api/feedback", (req, res) => {
  const { rating, comment, businessName } = req.body || {};
  const numericRating = Number(rating);

  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: "Feedback rating must be a number from 1 to 5."
    });
  }

  const storage = readStorage();
  storage.feedback.push({
    id: `feedback_${Date.now()}`,
    businessName: businessName || "Unknown",
    rating: numericRating,
    comment: comment || "",
    createdAt: new Date().toISOString()
  });
  writeStorage(storage);

  res.json({
    success: true,
    message: "Feedback saved. Thank you for testing RegReady AI."
  });
});

app.get("/api/feedback", (req, res) => {
  const storage = readStorage();
  const feedback = storage.feedback
    .slice()
    .reverse()
    .slice(0, 10)
    .map((item) => ({
      businessName: item.businessName,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt
    }));

  res.json({
    success: true,
    feedback
  });
});

ensureStorage();

app.listen(PORT, () => {
  console.log(`RegReady AI running at http://localhost:${PORT}`);
});
