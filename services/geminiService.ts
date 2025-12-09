import { GoogleGenAI, Type } from "@google/genai";
import { ReportData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meta: {
      type: Type.OBJECT,
      properties: {
        client: { type: Type.STRING },
        website: { type: Type.STRING },
        date: { type: Type.STRING },
        version: { type: Type.STRING },
        inspector: { type: Type.STRING },
      },
      required: ["client", "website", "date", "version", "inspector"],
    },
    executiveSummary: { type: Type.STRING, description: "A concise summary text in Dutch about the audit findings." },
    summary: {
      type: Type.OBJECT,
      properties: {
        wcag21: {
          type: Type.OBJECT,
          properties: {
            levelA: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
            levelAA: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
            total: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
          },
        },
        wcag22: {
          type: Type.OBJECT,
          properties: {
            levelA: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
            levelAA: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
            total: { type: Type.OBJECT, properties: { passed: { type: Type.INTEGER }, total: { type: Type.INTEGER } } },
          },
        },
      },
    },
    principles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                level: { type: Type.STRING, enum: ["A", "AA"] },
                result: { type: Type.STRING, enum: ["Voldoet", "Voldoet niet", "Niet van toepassing"] },
                findings: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING },
                      location: { type: Type.STRING },
                      technicalDetails: { type: Type.STRING },
                      solution: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ["id", "name", "description", "level", "result", "findings"],
            },
          },
        },
        required: ["id", "name", "description", "criteria"],
      },
    },
  },
  required: ["meta", "summary", "principles", "executiveSummary"],
};

export const generateReport = async (
  urls: Array<{ url: string; username?: string; password?: string }>,
  inspectorName: string
): Promise<ReportData> => {
  const urlList = urls.map(u => u.url).join(", ");
  
  const prompt = `
    Je bent een expert op het gebied van digitale toegankelijkheid (WCAG 2.2 AA).
    Je taak is om een realistisch, professioneel WCAG 2.2 AA auditrapport te genereren in het Nederlands, gebaseerd op de opgegeven URL's.
    
    Doelwit URL's: ${urlList}
    Naam van de inspecteur die het rapport opstelt: "${inspectorName || 'WCAG AI Auditor'}".
    Gebruik deze naam expliciet in het veld meta.inspector.

    Het rapport moet de structuur volgen van een professioneel auditrapport (zoals Cardan).
    
    Instructies:
    1. Analyseer de aard van de URL's (bijv. is het een webshop, een login pagina, een informatiesite?).
    2. Simuleer aannemelijke bevindingen die vaak voorkomen op dit soort websites (bijv. contrastproblemen, ontbrekende alt-teksten, focus indicators, formulieren zonder labels).
    3. Als er inloggegevens zijn opgegeven, neem aan dat de pagina's achter de login ook zijn geaudit.
    4. Genereer specifieke 'Findings' voor criteria die 'Voldoet niet' zijn. Wees specifiek in de beschrijving van het probleem en de oplossing.
    5. Zorg dat de totalen in de samenvatting kloppen met de individuele criteria.
    6. Gebruik professioneel Nederlands.
    7. Beoordeel alle 4 principes: Waarneembaar, Bedienbaar, Begrijpelijk, Robuust.
    8. Zorg dat nieuwe WCAG 2.2 criteria (zoals Focus Not Obscured, Dragging Movements) worden meegenomen.

    Genereer het volledige JSON object volgens het schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated");
    }
    return JSON.parse(text) as ReportData;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};