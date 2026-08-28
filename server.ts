import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  BROADWAY_SIMULATION_RESULT,
} from './src/data/mockCrisisData';
import { getCollection, getRecord, getRoadConfidence, hasSupabaseConfig, saveSimulation } from './src/server/supabase';
import { EmergencyRoute, Facility, OperationalZone, RoadSegment } from './src/types';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Nirnay Emergency Decision Engine',
      database: hasSupabaseConfig() ? 'supabase' : 'fallback',
      ai: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Graph endpoint (OpenStreetMap / GeoJSON spatial nodes)
  app.get('/api/graph', async (_req, res) => {
    const [roads, facilities, zones, assets] = await Promise.all([
      getCollection<RoadSegment>('roads'),
      getCollection('facilities'),
      getCollection('zones'),
      getCollection('assets'),
    ]);
    res.json({
      roads,
      facilities,
      zones,
      assets,
      timestamp: new Date().toISOString(),
    });
  });

  // Timeline, intelligence, and route data used by the existing frontend API modules.
  app.get('/api/events', async (_req, res) => {
    res.json(await getCollection('timeline_events'));
  });

  app.get('/api/intelligence', async (_req, res) => {
    res.json(await getCollection('intelligence_reports'));
  });

  app.get('/api/routes', async (_req, res) => {
    res.json(await getCollection<EmergencyRoute>('routes'));
  });

    // P4: Road confidence endpoint
  app.get('/api/confidence/:roadId', async (req, res) => {
    const { roadId } = req.params;
    const road = await getRecord<RoadSegment>('roads', roadId);
    if (!road) return res.status(404).json({ error: 'Road not found', roadId });
    const confidence = await getRoadConfidence(roadId);
    res.json({
      roadId,
      roadName: road.name,
      status: road.status,
      confidenceScore: confidence?.confidenceScore ?? road.confidenceScore,
      uncertaintyDescription: confidence?.uncertaintyDescription ?? road.uncertaintyDescription,
      sources: confidence?.sources ?? road.sources,
    });
  });

  // Simulation endpoint
  app.post('/api/simulate/close_road/:id', async (req, res) => {
    const { id } = req.params;
    const road = await getRecord<RoadSegment>('roads', id);
    if (!road) return res.status(404).json({ error: 'Road not found', roadId: id });
    const [zones, facilities, routes] = await Promise.all([
      getCollection<OperationalZone>('zones'),
      getCollection<Facility>('facilities'),
      getCollection<EmergencyRoute>('routes'),
    ]);
    const connectedZones = zones.filter((zone) => road.connectedZones.includes(zone.id));
    const peopleAffected = connectedZones.reduce((total, zone) => total + zone.population, 0) || Math.round(road.riskScore * 100);
    const hospitalsIsolated = Math.max(
      1,
      Math.min(
        3,
        facilities.filter((facility) => facility.type === 'HOSPITAL' && facility.floodRisk !== 'LOW').length,
      ),
    );
    const alternative = routes.find((route) => route.type === 'ALTERNATE') ?? routes[0];
    const delayAddedMinutes = Math.max(5, Math.round(road.lengthKm * (1 + road.riskScore / 100)));
    const result = {
      ...BROADWAY_SIMULATION_RESULT,
      simulatedEntityId: id,
      simulatedEntityName: road.name,
      peopleAffected,
      hospitalsIsolated,
      sheltersImpacted: Math.max(1, connectedZones.length),
      emergencyRoutesChanged: Math.max(1, Math.min(5, connectedZones.length + 1)),
      delayAddedMinutes,
      recommendedAlternative: alternative
        ? {
            routeId: alternative.id,
            routeName: alternative.name,
            explanation: `Use ${alternative.name} while ${road.name} is closed to preserve emergency access.`,
          }
        : BROADWAY_SIMULATION_RESULT.recommendedAlternative,
    };
    await saveSimulation(id, result);
    res.json(result);
  });

  // AI Explain endpoint
  app.post('/api/gemini/explain', async (req, res) => {
    const { action, context, roadId } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are NIRNAY, an AI Emergency Decision Command System.
Explain why the following emergency command recommendation is given:
Action: "${action || 'Divert traffic from Broadway St. to Route B (East Causeway)'}"
Context: "${context || 'Low elevation flooding, water rise rate 0.5m/hr, 3 hospitals at risk of isolation, 12k people affected'}"

Provide a concise, highly authoritative, tactical explanation structured as:
1. Clear reasoning (2-3 sentences max)
2. Priority level (CRITICAL / HIGH / MEDIUM)
3. Confidence percentage (e.g. 87%)
4. Counterfactual analysis (what happens if this action is NOT taken)
5. 3 concise evidence bullet points.

Format strictly as JSON with keys: title, explanation, priority, confidence (number), counterfactual, evidence (array of 3 strings).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (e) {
        console.error('Gemini explain error, fallback to built-in intelligence:', e);
      }
    }

    // High quality deterministic fallback
    res.json({
      title: 'Rationale: Prioritize Route B & Zone C Evacuation Corridor',
      explanation:
        'Broadway St. is experiencing 48cm flood water ingress with 0.5m/hr rise rate. Diverting emergency logistics to the elevated East Causeway (Route B) eliminates vehicle stall hazards and protects access to City Gen Hospital.',
      confidence: 87,
      priority: 'CRITICAL',
      counterfactual:
        'If Broadway St. remains in service, ambulance access will collapse within 20 minutes, isolating approximately 8,200 residents and delaying trauma triage by +45 minutes.',
      evidence: [
        'Hydro-sensor #W-19 verified 48cm depth with 1.8 m/s flow velocity.',
        '14 verified citizen reports confirm stalled civilian vehicles.',
        'Sentinel-1 SAR radar confirms East Causeway causeway is 100% dry.',
      ],
    });
  });

  // AI Chat endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    const { prompt } = req.body;
    const ai = getGeminiClient();

    if (ai && prompt) {
      try {
        const sysPrompt = `You are NIRNAY, an advanced AI Emergency Operations Decision Support System for crisis commanders.
Provide direct, concise, factual, and tactical answers for disaster response.
Always mention specific zones (Zone C, Zone A, Zone D), routes (Route B / East Causeway), and hospital capacities when relevant.
Format your response as a JSON object with:
- "text": string (the explanation with markdown bold highlights)
- "insightCard": optional object with keys: title, priorityBadge, estPopulation (number), waterRiseRate (string), recommendedZone (string), secondaryMetricLabel, secondaryMetricValue.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: sysPrompt,
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json(parsed);
        }
      } catch (err) {
        console.error('Gemini chat error, using expert decision engine fallback:', err);
      }
    }

    // Deterministic tactical fallback
    const lower = (prompt || '').toLowerCase();
    if (lower.includes('hospital') || lower.includes('bed')) {
      return res.json({
        text: 'City Gen Hospital ICU is at **86% capacity** (62 beds remaining). Highland Regional is operating nominally with **120 available beds**. We recommend routing all non-critical trauma to Highland via Route B.',
        insightCard: {
          title: 'Hospital Capacity & Triage',
          priorityBadge: 'Capacity Advisory',
          estPopulation: 450,
          waterRiseRate: 'Nominal',
          recommendedZone: 'Highland Regional',
          secondaryMetricLabel: 'Open ICU Beds',
          secondaryMetricValue: '182 Total',
        },
      });
    }

    res.json({
      text: "We're recommending **Zone C** first because it has the most people and the water is rising fastest there (0.5m/hr).",
      insightCard: {
        title: 'Critical Priority Area',
        priorityBadge: 'Critical Priority Area',
        estPopulation: 4200,
        waterRiseRate: '0.5m/hr',
        recommendedZone: 'Zone C',
        secondaryMetricLabel: 'Est. Inundation Time',
        secondaryMetricValue: '28 mins',
      },
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIRNAY Emergency Decision System running on http://localhost:${PORT}`);
  });
}

startServer();
