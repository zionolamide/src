import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-transaction-data.ts';
import '@/ai/flows/generate-risk-scores.ts';
import '@/ai/flows/summarize-transaction-alerts.ts';