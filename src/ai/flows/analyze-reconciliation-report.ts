'use server';
/**
 * @fileOverview A Genkit flow for analyzing petty cash reconciliation reports to identify discrepancies and unusual patterns.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReconciliationReportInputSchema = z.object({
  reportName: z.string().describe('The name or identifier of the reconciliation report.'),
  initialFundValue: z.number().describe('The initial assigned value of the petty cash fund.'),
  totalCashDebits: z.number().describe('The total amount of cash debits recorded.'),
  totalReimbursements: z.number().describe('The total amount of reimbursement invoices recorded.'),
  totalVales: z.number().describe('The total amount of vales/IOUs recorded.'),
  totalExpectedExpenses: z.number().describe('The sum of all expected expenses.'),
  expectedCashOnHand: z.number().describe('The expected cash remaining in the fund.'),
  physicalCashCount: z.number().describe('The actual physical cash amount counted.'),
  variance: z.number().describe('The difference between physical and expected.'),
  transactions: z.array(z.object({
    id: z.string(),
    type: z.enum(['cash_debit', 'reimbursement', 'vales']),
    description: z.string(),
    amount: z.number(),
  })),
});

export type AnalyzeReconciliationReportInput = z.infer<typeof AnalyzeReconciliationReportInputSchema>;

const AnalyzeReconciliationReportOutputSchema = z.object({
  hasSignificantDiscrepancy: z.boolean(),
  summaryAnalysis: z.string(),
  identifiedDiscrepancies: z.array(z.string()),
  unusualPatterns: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type AnalyzeReconciliationReportOutput = z.infer<typeof AnalyzeReconciliationReportOutputSchema>;

export async function analyzeReconciliationReport(input: AnalyzeReconciliationReportInput): Promise<AnalyzeReconciliationReportOutput> {
  return analyzeReconciliationReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReconciliationReportPrompt',
  input: { schema: AnalyzeReconciliationReportInputSchema },
  output: { schema: AnalyzeReconciliationReportOutputSchema },
  prompt: `You are an expert financial auditor. Analyze this petty cash reconciliation report:
Report Name: {{{reportName}}}
Initial Fund: {{{initialFundValue}}}
Fondo para cambio: {{{totalCashDebits}}}
Fondo Caja Chica: {{{totalReimbursements}}}
Vales: {{{totalVales}}}
Expected Cash: {{{expectedCashOnHand}}}
Physical Count: {{{physicalCashCount}}}
Variance: {{{variance}}}

Transactions/Summary:
{{#each transactions}}
- {{this.type}}: {{this.description}} ({{this.amount}})
{{/each}}

Provide:
1. Significant discrepancy status.
2. Summary analysis focusing on the expense categories.
3. List of specific discrepancies.
4. Unusual patterns (e.g. repeated descriptions, unusually large single expenses).
5. Recommendations to improve petty cash management.`,
});

const analyzeReconciliationReportFlow = ai.defineFlow(
  {
    name: 'analyzeReconciliationReportFlow',
    inputSchema: AnalyzeReconciliationReportInputSchema,
    outputSchema: AnalyzeReconciliationReportOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
