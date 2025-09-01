'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating risk scores for transactions based on fraud likelihood.
 *
 * - generateRiskScore - A function that generates a risk score for a given transaction.
 * - GenerateRiskScoreInput - The input type for the generateRiskScore function.
 * - GenerateRiskScoreOutput - The return type for the generateRiskScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRiskScoreInputSchema = z.object({
  transactionData: z.string().describe('JSON string of the transaction data.'),
});
export type GenerateRiskScoreInput = z.infer<typeof GenerateRiskScoreInputSchema>;

const GenerateRiskScoreOutputSchema = z.object({
  riskScore: z.number().describe('The risk score for the transaction (0-100).'),
  explanation: z.string().describe('Explanation of why the transaction received this risk score.'),
});
export type GenerateRiskScoreOutput = z.infer<typeof GenerateRiskScoreOutputSchema>;

export async function generateRiskScore(input: GenerateRiskScoreInput): Promise<GenerateRiskScoreOutput> {
  return generateRiskScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRiskScorePrompt',
  input: {schema: GenerateRiskScoreInputSchema},
  output: {schema: GenerateRiskScoreOutputSchema},
  prompt: `You are a fraud detection expert analyzing financial transactions to assess the risk of fraud.
  Given the following transaction data, evaluate the likelihood of fraud and assign a risk score between 0 and 100.
  Provide a brief explanation for the assigned risk score.

  Transaction Data: {{{transactionData}}}

  Consider factors such as transaction amount, user history, location, and any other relevant information to determine the risk score.
`,
});

const generateRiskScoreFlow = ai.defineFlow(
  {
    name: 'generateRiskScoreFlow',
    inputSchema: GenerateRiskScoreInputSchema,
    outputSchema: GenerateRiskScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
