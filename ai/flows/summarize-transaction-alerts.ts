'use server';
/**
 * @fileOverview Summarizes flagged transactions and alerts, highlighting key fraud indicators.
 *
 * - summarizeTransactionAlerts - A function that summarizes transaction alerts.
 * - SummarizeTransactionAlertsInput - The input type for the summarizeTransactionAlerts function.
 * - SummarizeTransactionAlertsOutput - The return type for the summarizeTransactionAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTransactionAlertsInputSchema = z.object({
  transactionDetails: z
    .string()
    .describe('Details of the flagged transactions, including transaction IDs, user details, amounts, and timestamps.'),
  alertDetails: z
    .string()
    .describe('Details of the alerts triggered, including alert types, risk scores, and triggering conditions.'),
});
export type SummarizeTransactionAlertsInput = z.infer<
  typeof SummarizeTransactionAlertsInputSchema
>;

const SummarizeTransactionAlertsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the flagged transactions and alerts, highlighting key indicators of potential fraud.'
    ),
});
export type SummarizeTransactionAlertsOutput = z.infer<
  typeof SummarizeTransactionAlertsOutputSchema
>;

export async function summarizeTransactionAlerts(
  input: SummarizeTransactionAlertsInput
): Promise<SummarizeTransactionAlertsOutput> {
  return summarizeTransactionAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTransactionAlertsPrompt',
  input: {schema: SummarizeTransactionAlertsInputSchema},
  output: {schema: SummarizeTransactionAlertsOutputSchema},
  prompt: `You are a fraud analysis expert. Summarize the following transaction and alert details, highlighting key indicators of potential fraud.

Transaction Details: {{{transactionDetails}}}
Alert Details: {{{alertDetails}}}

Summary:`, // The summary is what the user wants.
});

const summarizeTransactionAlertsFlow = ai.defineFlow(
  {
    name: 'summarizeTransactionAlertsFlow',
    inputSchema: SummarizeTransactionAlertsInputSchema,
    outputSchema: SummarizeTransactionAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
