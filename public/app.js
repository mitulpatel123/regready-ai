const intakeForm = document.getElementById("intakeForm");
const feedbackForm = document.getElementById("feedbackForm");
const reportSection = document.getElementById("reportSection");
const feedbackSection = document.getElementById("feedbackSection");
const loadingBox = document.getElementById("loadingBox");
const errorBox = document.getElementById("errorBox");
const reportOutput = document.getElementById("reportOutput");
const reportText = document.getElementById("reportText");
const scoreNumber = document.getElementById("scoreNumber");
const scoreHeadline = document.getElementById("scoreHeadline");
const scoreRing = document.getElementById("scoreRing");
const scoreMarker = document.getElementById("scoreMarker");
const riskBadge = document.getElementById("riskBadge");
const scoreExplanation = document.getElementById("scoreExplanation");
const dataExposureInsight = document.getElementById("dataExposureInsight");
const policyInsight = document.getElementById("policyInsight");
const vendorInsight = document.getElementById("vendorInsight");
const submitButton = document.getElementById("submitButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackList = document.getElementById("feedbackList");
const generatePilotPlanButton = document.getElementById("generatePilotPlanButton");
const pilotLoading = document.getElementById("pilotLoading");
const pilotError = document.getElementById("pilotError");
const pilotOutput = document.getElementById("pilotOutput");
const upgradeToast = document.getElementById("upgradeToast");

let latestReport = "";
let latestBusinessName = "";
let latestScore = null;
let latestRiskLevel = "";
let latestCreatedAt = "";
let latestIntakeData = {};
let sampleIndex = -1;

const sampleCases = [
  {
    businessName: "BrightCare Clinic",
    businessType: "Healthcare Office",
    businessSize: "6-20 employees",
    biggestConcern: "Privacy",
    aiUses: [
      "Appointment reminders",
      "Email or message drafting",
      "Customer support replies"
    ],
    customerData: "Yes",
    publicAiTools: "Yes",
    hrDecisions: "No",
    customerFacingContent: "Yes",
    disclosesAi: "No",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "No",
    additionalNotes:
      "The clinic uses AI to draft appointment reminders and support replies. Staff sometimes paste message drafts into public AI tools before sending to patients."
  },
  {
    businessName: "Maple Street Outfitters",
    businessType: "Retail / E-commerce",
    businessSize: "1-5 employees",
    biggestConcern: "Copyright",
    aiUses: [
      "Marketing content",
      "Product descriptions",
      "Social media posts"
    ],
    customerData: "No",
    publicAiTools: "Yes",
    hrDecisions: "No",
    customerFacingContent: "Yes",
    disclosesAi: "Not sure",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "No",
    additionalNotes:
      "The store uses AI to write product descriptions and promotional posts for seasonal campaigns. The owner is unsure how to check AI-generated copy for originality."
  },
  {
    businessName: "Northstar Talent Partners",
    businessType: "HR / Recruiting",
    businessSize: "21-50 employees",
    biggestConcern: "Bias or fairness",
    aiUses: [
      "Hiring or job descriptions",
      "Email or message drafting",
      "Analytics or reporting"
    ],
    customerData: "Yes",
    publicAiTools: "Yes",
    hrDecisions: "Yes",
    customerFacingContent: "No",
    disclosesAi: "No",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "Not sure",
    additionalNotes:
      "Recruiters use AI to draft job posts, summarize resumes, and prepare outreach messages. Management wants to avoid unfair screening decisions."
  },
  {
    businessName: "PixelPeak Marketing",
    businessType: "Marketing Agency",
    businessSize: "6-20 employees",
    biggestConcern: "Customer trust",
    aiUses: [
      "Marketing content",
      "Social media posts",
      "Analytics or reporting",
      "Email or message drafting"
    ],
    customerData: "Not sure",
    publicAiTools: "Yes",
    hrDecisions: "No",
    customerFacingContent: "Yes",
    disclosesAi: "Yes",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "Yes",
    additionalNotes:
      "The agency uses AI for first drafts and campaign ideas, then account managers review all output before client delivery."
  },
  {
    businessName: "Harbor Table Bistro",
    businessType: "Restaurant / Local Service",
    businessSize: "21-50 employees",
    biggestConcern: "Employee misuse",
    aiUses: [
      "Social media posts",
      "Appointment reminders",
      "Customer support replies",
      "Internal productivity"
    ],
    customerData: "No",
    publicAiTools: "Yes",
    hrDecisions: "No",
    customerFacingContent: "Yes",
    disclosesAi: "No",
    thirdPartyVendors: "No",
    hasWrittenPolicy: "No",
    additionalNotes:
      "Managers use AI to draft event posts, reservation replies, and shift announcements. There is no formal approval process before content is posted."
  },
  {
    businessName: "CivicPath Training Center",
    businessType: "Education / Training",
    businessSize: "51-100 employees",
    biggestConcern: "Data security",
    aiUses: [
      "Internal productivity",
      "Analytics or reporting",
      "Email or message drafting"
    ],
    customerData: "Yes",
    publicAiTools: "No",
    hrDecisions: "No",
    customerFacingContent: "No",
    disclosesAi: "Not sure",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "Yes",
    additionalNotes:
      "The training center uses AI features inside learning software to summarize course activity and draft internal reports."
  },
  {
    businessName: "Summit Ledger Advisors",
    businessType: "Professional Services",
    businessSize: "6-20 employees",
    biggestConcern: "Legal uncertainty",
    aiUses: [
      "Email or message drafting",
      "Analytics or reporting",
      "Internal productivity"
    ],
    customerData: "Not sure",
    publicAiTools: "Yes",
    hrDecisions: "No",
    customerFacingContent: "Yes",
    disclosesAi: "Not sure",
    thirdPartyVendors: "Yes",
    hasWrittenPolicy: "Not sure",
    additionalNotes:
      "Consultants use AI to draft client emails, summarize notes, and outline reports. The firm wants clearer boundaries before expanding AI use."
  }
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getRadioValue(formData, name) {
  return formData.get(name) || "";
}

function collectFormData() {
  const formData = new FormData(intakeForm);
  return {
    businessName: formData.get("businessName")?.trim(),
    businessType: formData.get("businessType"),
    businessSize: formData.get("businessSize"),
    aiUses: formData.getAll("aiUses"),
    customerData: getRadioValue(formData, "customerData"),
    publicAiTools: getRadioValue(formData, "publicAiTools"),
    hrDecisions: getRadioValue(formData, "hrDecisions"),
    customerFacingContent: getRadioValue(formData, "customerFacingContent"),
    disclosesAi: getRadioValue(formData, "disclosesAi"),
    thirdPartyVendors: getRadioValue(formData, "thirdPartyVendors"),
    hasWrittenPolicy: getRadioValue(formData, "hasWrittenPolicy"),
    biggestConcern: formData.get("biggestConcern"),
    additionalNotes: formData.get("additionalNotes")?.trim()
  };
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading
    ? "Generating..."
    : "Generate Compliance Report";
  reportSection.classList.remove("hidden");
  loadingBox.classList.toggle("hidden", !isLoading);
  errorBox.classList.add("hidden");
  if (isLoading) {
    reportOutput.classList.add("hidden");
    feedbackSection.classList.add("hidden");
  }
}

function getRiskClass(riskLevel) {
  const lower = riskLevel.toLowerCase();
  if (lower.includes("high")) return "high";
  if (lower.includes("moderate")) return "moderate";
  return "low";
}

function formatReport(report) {
  const escaped = report
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withInlineFormatting = escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/<strong>(REGREADY AI COMPLIANCE READINESS REPORT)<\/strong>/g, "$1")
    .replace(/<strong>(\d+\.\s(?:Business Snapshot|Overall Readiness Score|Top Risk Areas|AI Use Policy Draft|Employee Guidance|Customer Disclosure Language|Vendor-Risk Checklist|Recommended Next Steps|Human Review Notice|Disclaimer))<\/strong>/g, "$1")
    .replace(/^-\s(.+)$/gm, "<span class=\"report-bullet\">$1</span>")
    .replace(/^(\d+)\.\s(?!Business Snapshot|Overall Readiness Score|Top Risk Areas|AI Use Policy Draft|Employee Guidance|Customer Disclosure Language|Vendor-Risk Checklist|Recommended Next Steps|Human Review Notice|Disclaimer)(.+)$/gm, "<span class=\"report-numbered\"><b>$1.</b> $2</span>");

  const title = "REGREADY AI COMPLIANCE READINESS REPORT";
  const sectionPattern = /(?:^|\n)(\d+\.\s(?:Business Snapshot|Overall Readiness Score|Top Risk Areas|AI Use Policy Draft|Employee Guidance|Customer Disclosure Language|Vendor-Risk Checklist|Recommended Next Steps|Human Review Notice|Disclaimer))/g;
  const matches = [...withInlineFormatting.matchAll(sectionPattern)];
  let output = `<div class="report-title">${title}</div>`;

  matches.forEach((match, index) => {
    const heading = match[1];
    const bodyStart = match.index + match[0].length;
    const bodyEnd = matches[index + 1]?.index ?? withInlineFormatting.length;
    const body = withInlineFormatting
      .slice(bodyStart, bodyEnd)
      .replace(title, "")
      .trim();

    output += `<section class="report-card"><h3>${heading}</h3>${body}</section>`;
  });

  return matches.length ? output : `<div class="report-title">${title}</div><section class="report-card">${withInlineFormatting}</section>`;
}

function getInsightText(value, positiveText, cautionText, unknownText = "Needs review") {
  if (value === "Yes") return cautionText;
  if (value === "No") return positiveText;
  return unknownText;
}

function updateVisualSummary(score, riskLevel) {
  const scoreColor =
    riskLevel === "High Risk"
      ? "#b42318"
      : riskLevel === "Moderate Risk"
        ? "#b54708"
        : "#11845b";

  scoreRing.style.setProperty("--score", `${score}%`);
  scoreRing.style.setProperty("--score-color", scoreColor);
  scoreMarker.style.left = `${score}%`;

  scoreHeadline.textContent =
    riskLevel === "High Risk"
      ? "Immediate controls needed"
      : riskLevel === "Moderate Risk"
        ? "Improve before scaling"
        : "Strong starting position";

  dataExposureInsight.textContent = getInsightText(
    latestIntakeData.customerData,
    "Limited exposure",
    "Personal data risk",
    "Clarify data use"
  );
  policyInsight.textContent = getInsightText(
    latestIntakeData.hasWrittenPolicy,
    "Policy documented",
    "Policy missing",
    "Policy unclear"
  );
  vendorInsight.textContent = getInsightText(
    latestIntakeData.thirdPartyVendors,
    "Low vendor exposure",
    "Vendor review needed",
    "Vendor status unclear"
  );
}

function displayReport(data) {
  latestReport = data.report;
  latestScore = data.score;
  latestRiskLevel = data.riskLevel;
  latestCreatedAt = data.createdAt;

  scoreNumber.textContent = String(data.score);
  riskBadge.textContent = data.riskLevel;
  riskBadge.className = `risk-badge ${getRiskClass(data.riskLevel)}`;
  updateVisualSummary(data.score, data.riskLevel);
  scoreExplanation.textContent =
    data.riskLevel === "High Risk"
      ? "Multiple selected answers indicate higher exposure and a need for immediate policy, privacy, and human-review controls."
      : data.riskLevel === "Moderate Risk"
        ? "Some selected answers create meaningful exposure. Clear policies, disclosures, and vendor review can improve readiness."
        : "Selected answers suggest lower current exposure, but the business should still document AI use and review outputs.";

  reportText.innerHTML = formatReport(data.report);
  loadingBox.classList.add("hidden");
  reportOutput.classList.remove("hidden");
  feedbackSection.classList.remove("hidden");
  scrollToSection("reportSection");
}

function showError(message) {
  loadingBox.classList.add("hidden");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function downloadReport() {
  if (!latestReport) return;
  const safeName = (latestBusinessName || "regready-report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const content = [
    `RegReady AI Report`,
    `Business: ${latestBusinessName || "Unknown"}`,
    `Score: ${latestScore}`,
    `Risk Level: ${latestRiskLevel}`,
    `Created: ${latestCreatedAt}`,
    "",
    latestReport
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeName || "regready-report"}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function setRadio(name, value) {
  const input = intakeForm.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) input.checked = true;
}

function setCheckboxes(values) {
  intakeForm.querySelectorAll('input[name="aiUses"]').forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function applySampleToForm(sample) {
  intakeForm.businessName.value = sample.businessName;
  intakeForm.businessType.value = sample.businessType;
  intakeForm.businessSize.value = sample.businessSize;
  intakeForm.biggestConcern.value = sample.biggestConcern;
  intakeForm.additionalNotes.value = sample.additionalNotes;

  setCheckboxes(sample.aiUses);
  setRadio("customerData", sample.customerData);
  setRadio("publicAiTools", sample.publicAiTools);
  setRadio("hrDecisions", sample.hrDecisions);
  setRadio("customerFacingContent", sample.customerFacingContent);
  setRadio("disclosesAi", sample.disclosesAi);
  setRadio("thirdPartyVendors", sample.thirdPartyVendors);
  setRadio("hasWrittenPolicy", sample.hasWrittenPolicy);
}

function getNextSampleCase() {
  sampleIndex = (sampleIndex + 1) % sampleCases.length;
  return sampleCases[sampleIndex];
}

function fillSampleCase() {
  const sample = getNextSampleCase();

  applySampleToForm(sample);

  document.getElementById("fillSampleButton").textContent =
    `Loaded: ${sample.businessName}`;
  document.getElementById("sampleHeroButton").textContent =
    `Loaded: ${sample.businessName}`;

  scrollToSection("scan");
}

function trySampleBusiness() {
  const brightCareSample = sampleCases[0];
  applySampleToForm(brightCareSample);
  document.getElementById("fillSampleButton").textContent =
    `Loaded: ${brightCareSample.businessName}`;
  document.getElementById("sampleHeroButton").textContent = "Load Random Sample";
  scrollToSection("scan");
  window.setTimeout(() => intakeForm.requestSubmit(), 350);
}

function showUpgradeMessage() {
  upgradeToast.classList.remove("hidden");
  window.clearTimeout(showUpgradeMessage.timer);
  showUpgradeMessage.timer = window.setTimeout(() => {
    upgradeToast.classList.add("hidden");
  }, 6000);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function renderFeedbackList(feedback) {
  if (!feedback.length) {
    feedbackList.innerHTML =
      '<article class="empty-feedback">Submit feedback after a report to start building validation evidence.</article>';
    return;
  }

  feedbackList.innerHTML = feedback
    .map((item) => {
      const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
      const safeBusiness = String(item.businessName || "MVP tester")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const safeComment = String(item.comment || "No written comment provided.")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `
        <article class="feedback-card">
          <div class="feedback-card-top">
            <strong>${safeBusiness}</strong>
            <span>${stars}</span>
          </div>
          <p>${safeComment}</p>
          <time>${formatDate(item.createdAt)}</time>
        </article>
      `;
    })
    .join("");
}

function formatGeneratedBrief(text) {
  const escaped = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/<strong>(AI PILOT VALIDATION BRIEF)<\/strong>/g, "$1")
    .replace(/<strong>(\d+\.\s[^<]+)<\/strong>/g, "$1")
    .replace(/^-\s(.+)$/gm, '<span class="report-bullet">$1</span>');

  return escaped.replace(
    /(^|\n)(AI PILOT VALIDATION BRIEF|\d+\.\s[^\n]+)/g,
    (match, prefix, heading) => {
      if (heading === "AI PILOT VALIDATION BRIEF") {
        return `${prefix}<div class="pilot-output-title">${heading}</div>`;
      }
      return `${prefix}<h4>${heading}</h4>`;
    }
  );
}

async function loadFeedbackList() {
  try {
    const response = await fetch("/api/feedback");
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error("Feedback could not be loaded.");
    }
    renderFeedbackList(data.feedback);
  } catch (error) {
    feedbackList.innerHTML =
      '<article class="empty-feedback">Feedback is unavailable right now.</article>';
  }
}

async function generatePilotPlan() {
  generatePilotPlanButton.disabled = true;
  pilotLoading.classList.remove("hidden");
  pilotError.classList.add("hidden");
  pilotOutput.classList.add("hidden");

  try {
    const response = await fetch("/api/generate-pilot-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Pilot plan generation failed.");
    }

    pilotOutput.innerHTML = `
      <div class="pilot-stats">
        <span>${data.stats.reportCount} saved reports analyzed</span>
        <span>${data.stats.feedbackCount} feedback entries analyzed</span>
      </div>
      ${formatGeneratedBrief(data.pilotPlan)}
    `;
    pilotOutput.classList.remove("hidden");
  } catch (error) {
    pilotError.textContent = error.message;
    pilotError.classList.remove("hidden");
  } finally {
    pilotLoading.classList.add("hidden");
    generatePilotPlanButton.disabled = false;
  }
}

document.getElementById("startScanButton").addEventListener("click", () => {
  scrollToSection("scan");
});

document.getElementById("headerStartButton").addEventListener("click", () => {
  scrollToSection("scan");
});

document.getElementById("sampleHeroButton").addEventListener("click", fillSampleCase);
document.getElementById("fillSampleButton").addEventListener("click", fillSampleCase);
document
  .getElementById("trySampleBusinessButton")
  .addEventListener("click", trySampleBusiness);

document.querySelectorAll(".pricing-button").forEach((button) => {
  button.addEventListener("click", showUpgradeMessage);
});

document
  .getElementById("refreshFeedbackButton")
  .addEventListener("click", loadFeedbackList);

generatePilotPlanButton.addEventListener("click", generatePilotPlan);

document.getElementById("copyReportButton").addEventListener("click", async () => {
  if (!latestReport) return;
  await navigator.clipboard.writeText(latestReport);
  document.getElementById("copyReportButton").textContent = "Copied";
  setTimeout(() => {
    document.getElementById("copyReportButton").textContent = "Copy Report";
  }, 1600);
});

document.getElementById("downloadReportButton").addEventListener("click", downloadReport);

document.getElementById("printReportButton").addEventListener("click", () => {
  window.print();
});

document.getElementById("newScanButton").addEventListener("click", () => {
  reportSection.classList.add("hidden");
  feedbackSection.classList.add("hidden");
  feedbackMessage.textContent = "";
  scrollToSection("scan");
});

intakeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = collectFormData();
  latestIntakeData = payload;
  latestBusinessName = payload.businessName;

  if (!payload.aiUses.length) {
    reportSection.classList.remove("hidden");
    showError("Select at least one current AI use before generating a report.");
    scrollToSection("reportSection");
    return;
  }

  setLoading(true);
  scrollToSection("reportSection");

  try {
    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Report generation failed.");
    }

    displayReport(data);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(feedbackForm);
  feedbackMessage.textContent = "Saving feedback...";

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(formData.get("rating")),
        comment: formData.get("comment")?.trim(),
        businessName: latestBusinessName
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Feedback could not be saved.");
    }

    feedbackMessage.textContent = data.message;
    feedbackForm.reset();
    loadFeedbackList();
  } catch (error) {
    feedbackMessage.textContent = error.message;
  }
});

loadFeedbackList();
