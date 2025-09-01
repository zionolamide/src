// src/ai/flows/analyze-transaction-data.ts
'use server';

/**
 * @fileOverview Analyzes transaction data in real-time to identify suspicious patterns and anomalies.
 *
 * - analyzeTransactionData - A function that analyzes transaction data.
 * - AnalyzeTransactionDataInput - The input type for the analyzeTransactionData function.
 * - AnalyzeTransactionDataOutput - The return type for the analyzeTransactionData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTransactionDataInputSchema = z.object({
  transactionData: z.string().describe('The full transaction data object to analyze in JSON format.'),
});
export type AnalyzeTransactionDataInput = z.infer<typeof AnalyzeTransactionDataInputSchema>;

const AnalyzeTransactionDataOutputSchema = z.object({
  isSuspicious: z.boolean().describe('Whether the transaction is suspicious or not.'),
  reason: z.string().describe('The reason for the transaction being suspicious, if any.'),
  riskScore: z.number().describe('A risk score between 0 and 1 indicating the likelihood of fraud.'),
});
export type AnalyzeTransactionDataOutput = z.infer<typeof AnalyzeTransactionDataOutputSchema>;

export async function analyzeTransactionData(input: AnalyzeTransactionDataInput): Promise<AnalyzeTransactionDataOutput> {
  return analyzeTransactionDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTransactionDataPrompt',
  input: {schema: AnalyzeTransactionDataInputSchema},
  output: {schema: AnalyzeTransactionDataOutputSchema},
  prompt: `You are a fraud detection expert analyzing e-payment transaction data in real-time.
  Your task is to identify suspicious patterns and anomalies.

  Analyze the following transaction data and determine if it is suspicious.
  Provide a risk score between 0 and 1 (0 being not risky, and 1 being highly risky), an isSuspicious boolean, and a concise reason if it is suspicious.

  Consider the following factors in your analysis:
  - Transaction amount: Is it unusually high or low for this user?
  - Location: Is the transaction occurring from a new or unusual location for this user?
  - Time of day: Is the transaction happening at an odd hour (e.g., late at night)?
  - User history (if available from the data): Are there any deviations from normal spending patterns?

  Transaction Data:
  {{{transactionData}}}

  Base your entire analysis on the provided data. Ensure the output is a valid JSON object that conforms to the required schema.
  `,
});

const analyzeTransactionDataFlow = ai.defineFlow(
  {
    name: 'analyzeTransactionDataFlow',
    inputSchema: AnalyzeTransactionDataInputSchema,
    outputSchema: AnalyzeTransactionDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
