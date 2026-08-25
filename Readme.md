<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e83a3932-6e7e-471b-9e08-cb93fdaabaee

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 📂 Scenario Data (`demo_data/scenario.json`)

This file contains **sample disaster reports** used for simulation and testing.  
It helps the AI/confidence module handle **conflicting inputs** (e.g., citizen vs. sensor reports).

### 🔹 Usage
1. Load the JSON file in your integration code:
   ```ts
   const fs = require('fs');
   const reports = JSON.parse(fs.readFileSync('./demo_data/scenario.json', 'utf8'));
