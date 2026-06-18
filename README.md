# RegReady AI

AI Compliance Readiness Assistant for Small Businesses

RegReady AI is a testable MVP / proof of concept for a COMP630 Technology Entrepreneurship final project. A user enters how a small business uses AI, the Express backend scores risk signals, Gemini generates a practical compliance readiness report, and the user can copy, download, print, and rate the output.

## Features

- Professional single-page SaaS-style MVP
- Full AI-use intake form for small-business compliance planning
- Gemini API integration through a secure backend endpoint
- Internal readiness scoring logic with Low, Moderate, and High Risk badges
- Structured report sections for policy, employee guidance, customer disclosure, vendor questions, and next steps
- Copy, download, and print report actions
- Feedback rating workflow
- Public feedback display with count and average rating for MVP validation evidence
- Pricing model section with MVP-stage upgrade messaging
- Target customer and beachhead market section
- Pilot roadmap, current ask, and Gemini-generated pilot validation brief
- One-click BrightCare demo button that fills and generates a sample report
- Local JSON storage in `data/reports.json`
- Rotating sample test case button with multiple business scenarios

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js with Express
- AI Integration: Google Gemini API
- Storage: JSON file storage
- Database: none

## Run Locally

```bash
npm install
cp .env.example .env
```

Add your Gemini API key to `.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

Start the app:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

For development with automatic restart:

```bash
npm run dev
```

## MVP Workflow

1. User opens the landing page.
2. User clicks `Start Readiness Scan`.
3. User completes the AI-use intake form.
4. Frontend sends answers to `POST /api/generate-report`.
5. Express validates required fields and calculates a readiness score.
6. Backend sends a structured prompt to Gemini.
7. Gemini returns a practical compliance readiness report.
8. User sees the score, risk badge, and report on screen.
9. User copies, downloads, or prints the report.
10. User rates the usefulness of the report.

## API Endpoints

### `GET /`

Serves the web application.

### `GET /api/health`

Returns:

```json
{
  "status": "ok",
  "app": "RegReady AI"
}
```

### `POST /api/generate-report`

Accepts JSON intake form data, sends a structured prompt to Gemini, and returns:

```json
{
  "success": true,
  "report": "...",
  "score": 65,
  "riskLevel": "Moderate Risk",
  "createdAt": "2026-06-18T14:00:00.000Z"
}
```

### `POST /api/feedback`

Accepts:

```json
{
  "rating": 5,
  "comment": "Useful report",
  "businessName": "BrightCare Clinic"
}
```

Stores feedback in `data/reports.json`.

### `POST /api/generate-pilot-plan`

Uses Gemini to analyze saved reports and tester feedback, then returns a pilot validation brief:

```json
{
  "success": true,
  "pilotPlan": "AI PILOT VALIDATION BRIEF...",
  "createdAt": "2026-06-18T14:00:00.000Z",
  "stats": {
    "reportCount": 5,
    "feedbackCount": 5
  }
}
```

### `GET /api/feedback`

Returns the latest tester feedback for display on the website:

```json
{
  "success": true,
  "feedback": [
    {
      "businessName": "BrightCare Clinic",
      "rating": 5,
      "comment": "Useful report",
      "createdAt": "2026-06-18T14:00:00.000Z"
    }
  ]
}
```

## Scoring Logic

The backend starts each scan at 80 points.

- Subtract 15 if customer personal data is entered into AI tools.
- Subtract 15 if employees use public AI tools and there is no written AI policy.
- Subtract 15 if AI is used in HR decisions.
- Subtract 10 if customer-facing AI content is used without disclosure.
- Subtract 10 if third-party AI vendors are used.
- Subtract 10 if the biggest concern is privacy, legal uncertainty, or data security.
- Minimum score is 0.
- Maximum score is 100.

Risk levels:

- 0-39: High Risk
- 40-69: Moderate Risk
- 70-100: Low Risk

## Sample Test Case

Use the `Fill Random Sample` button until BrightCare Clinic appears, or enter:

- Business Name: BrightCare Clinic
- Business Type: Healthcare Office
- Business Size: 6-20 employees
- AI Uses: Appointment reminders, email drafting, customer support replies
- Customer Data: Yes
- Public AI Tools: Yes
- HR Decisions: No
- Customer-Facing Content: Yes
- Disclosure: No
- Third-Party Vendors: Yes
- Written AI Policy: No
- Biggest Concern: Privacy

Expected output: a High or Moderate Risk report with privacy risk, employee AI policy, disclosure statement, vendor checklist, and practical next steps.

## Academic Project Note

This MVP is designed for a COMP630 Technology Entrepreneurship final venture package. It demonstrates a testable AI-enabled workflow where a user enters business information, the system triggers an AI process, the user receives a useful output, and the app stores feedback for validation.

This MVP provides educational and planning support only. It is not legal advice. Businesses should consult qualified legal or compliance professionals before relying on any policy.

## Deployment Note for VPS/KVM

1. Install Node.js 18+ on the server.
2. Upload or clone the `regready-ai` folder.
3. Run `npm install`.
4. Create `.env` with `GEMINI_API_KEY`, `GEMINI_MODEL`, and `PORT`.
5. Start with `npm start` or a process manager such as `pm2`.
6. Put Nginx or Apache in front of the Node process for HTTPS and domain routing.

Example `pm2` command:

```bash
pm2 start server.js --name regready-ai
```

## Final Exam Deliverables Supported

- MVP / POC link: deploy this app locally or on a VPS.
- Demo video: show intake, AI report generation, export, and feedback.
- Final pitch deck screenshots: use the hero, scan form, score panel, and report sections.
- Final report technical architecture section: use the workflow and endpoint sections above.
- Prompt library appendix: summarize the structured prompt in `server.js`.
- Risk and IP memo appendix: use generated risk areas, disclaimer language, and vendor questions.

## Remaining Risks and Scaling Considerations

- Legal accuracy requires professional review and jurisdiction-specific analysis.
- AI output quality depends on prompt design, model behavior, and user-provided context.
- Production use would need authentication, database storage, audit logs, encryption, rate limiting, and stronger input validation.
- Cost drivers include AI API usage, report length, repeated scans, hosting, monitoring, and support.
- Larger deployments should add queueing, retry logic, observability, and role-based access controls.
