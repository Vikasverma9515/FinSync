/**
 * Investment Plan AI Service
 * Handles personalized investment plan generation using Groq AI
 */

import OpenAI from "openai";
import type { InvestmentQuestionnaireData, UserProfile, InvestmentPlanOutput } from '../../../types';

export interface AIConfig {
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIResponse<T = any> {
  success: boolean;
  data: T;
  confidence: number;
  metadata: {
    processingTime: number;
    privacyCompliant: boolean;
  };
  error?: string;
}

class InvestmentPlanService {
  private config: AIConfig = {
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    maxTokens: 3000,
  };

  /**
   * Generate personalized investment plan
   */
  async generatePersonalizedPlan(
    questionnaireData: InvestmentQuestionnaireData,
    userProfile?: UserProfile
  ): Promise<AIResponse<InvestmentPlanOutput>> {
    const startTime = Date.now();

    try {
      const client = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      });

      // Create the prompt
      const userPrompt = this.createInvestmentPrompt(questionnaireData, userProfile);

      const response = await client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const text = response.choices[0]?.message?.content || "";

      console.log('Raw response from Groq:', text);

      // Parse JSON from response - handle markdown code blocks
      let jsonText = text;

      // Remove markdown code blocks if present
      const codeBlockMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }

      // Try to extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to extract JSON. Response text:', text);
        throw new Error("No JSON found in response");
      }

      const planData = JSON.parse(jsonMatch[0]);
      const validatedPlan = this.validateAndFormatPlan(planData);

      return {
        success: true,
        data: validatedPlan,
        confidence: 0.9,
        metadata: {
          processingTime: Date.now() - startTime,
          privacyCompliant: true,
        },
      };
    } catch (error) {
      console.error('Investment plan generation error:', error);
      return {
        success: false,
        data: this.getFallbackPlan(questionnaireData, userProfile),
        confidence: 0,
        metadata: {
          processingTime: Date.now() - startTime,
          privacyCompliant: true,
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createInvestmentPrompt(questionnaireData: InvestmentQuestionnaireData, userProfile?: UserProfile): string {
    const age = userProfile?.age || 35;
    const monthlyIncome = userProfile?.annual_income ? userProfile.annual_income / 12 : 50000;
    const annualIncome = userProfile?.annual_income || 600000;
    const netWorth = userProfile?.total_net_worth || 500000;
    const dependents = userProfile?.dependents || 0;
    const monthlyCommitment = questionnaireData.monthlyCommitment ? parseInt(questionnaireData.monthlyCommitment) : Math.floor(monthlyIncome * 0.2);

    const investmentHorizonYears = questionnaireData.investmentHorizon === 'short' ? 3 :
      questionnaireData.investmentHorizon === 'medium' ? 7 : 15;

    const planTypeDescriptions = {
      'growth_accelerator': 'aggressive growth with maximum returns potential',
      'balanced_wealth_builder': 'balanced approach with steady wealth accumulation',
      'conservative_income_generator': 'conservative approach focusing on steady income and capital preservation'
    };

    return `You are a highly experienced Indian financial advisor with 20+ years of expertise in stock market investments, mutual funds, and wealth management. 

USER PROFILE:
- Age: ${age} years old
- Annual Income: ₹${annualIncome.toLocaleString()}
- Monthly Income: ₹${monthlyIncome.toFixed(0).toLocaleString()}
- Current Net Worth: ₹${netWorth.toLocaleString()}
- Dependents: ${dependents}
- Experience Level: ${questionnaireData.experienceLevel}
- Risk Tolerance: ${questionnaireData.riskComfort}
- Investment Horizon: ${investmentHorizonYears} years
- Monthly Investment Capacity: ₹${monthlyCommitment.toLocaleString()}
- Strategy: ${planTypeDescriptions[questionnaireData.planType as keyof typeof planTypeDescriptions]}
- Financial Goals: ${questionnaireData.financialGoals?.join(', ') || 'Long-term wealth creation'}
- Preferred Sectors: ${questionnaireData.preferredSectors?.join(', ') || 'Technology, Banking, FMCG, Pharma'}

CREATE A HIGHLY PERSONALIZED INVESTMENT PLAN with these specific requirements:

1. **SPECIFIC INVESTMENT AMOUNTS**: Calculate exact rupee amounts based on their income
2. **REAL NUMBERS & PROJECTIONS**: Include specific 1-year, 3-year, 5-year wealth projections
3. **SAVINGS STRATEGY**: Recommend how much to save monthly and from which income bucket
4. **CONCRETE EXAMPLES**: Use their actual income/net worth in all examples
5. **ACTIONABLE STEPS**: Provide step-by-step implementation with specific timelines and amounts
6. **TAX EFFICIENCY**: Include tax-saving strategies relevant to their income bracket
7. **RISK MITIGATION**: Specify exactly what percentage should go to debt/fixed deposits

Respond ONLY with valid JSON in this exact format:
{
  "plan_name": "A compelling, personalized plan name reflecting their strategy",
  "plan_type": "${questionnaireData.planType}",
  "description": "2-3 sentences deeply personalized to their situation with specific income/age references",
  "risk_level": "${questionnaireData.riskComfort === 'high' ? 'high' : questionnaireData.riskComfort === 'low' ? 'low' : 'medium'}",
  "expected_return": "e.g., '12-15% annually based on your portfolio, which could grow your ₹${netWorth.toLocaleString()} to ₹X in ${investmentHorizonYears} years'",
  "recommended_stocks": [
    {
      "symbol": "string (NSE symbol with .NS)",
      "name": "string",
      "allocation": number (percentage, must sum to 100),
      "sector": "string",
      "reasoning": "Specific reason why this stock fits their profile with numbers if applicable"
    }
  ],
  "allocation": [
    {
      "assetClass": "string (e.g., 'Large Cap Stocks', 'Government Bonds')",
      "percentage": number (must sum to 100),
      "reasoning": "Brief explanation"
    }
  ],
  "suggestions": [
    {
      "name": "string (e.g., 'Nifty 50 ETF')",
      "type": "string (e.g., 'ETF', 'Mutual Fund')",
      "description": "Brief description",
      "expectedReturn": "string (e.g., '12-14%')",
      "riskLevel": "string (e.g., 'Medium')"
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Actionable step title",
      "description": "Detailed description with specific amounts based on their monthly commitment of ₹${monthlyCommitment}",
      "actions": ["Specific action 1 with numbers", "Specific action 2 with timeline"],
      "timeline": "Specific timeline",
      "expected_outcome": "Concrete outcome with rupee amounts"
    }
  ],
  "summary": "Comprehensive summary explaining exactly how they will accumulate wealth with specific monthly/yearly figures",
  "status": "ok"
}`;
  }

  private validateAndFormatPlan(planData: any): InvestmentPlanOutput {
    // Ensure required fields exist with defaults
    const validatedPlan: InvestmentPlanOutput = {
      plan_name: planData.plan_name || 'Your Personalized Investment Strategy',
      plan_type: planData.plan_type || 'balanced_wealth_builder',
      description: planData.description || 'A customized investment approach designed specifically for your situation and goals.',
      risk_level: ['low', 'medium', 'high'].includes(planData.risk_level) ? planData.risk_level : 'medium',
      expected_return: planData.expected_return || '10-14% annually, depending on market conditions',
      recommended_stocks: this.validateStocks(planData.recommended_stocks || []),
      allocation: this.validateAllocation(planData.allocation || []),
      suggestions: this.validateSuggestions(planData.suggestions || []),
      steps: this.validateSteps(planData.steps || []),
      summary: planData.summary || 'This plan provides a structured approach to building wealth while managing risk appropriately for your profile.',
      status: planData.status || 'ok',
      reason: planData.advisor_notes || planData.reason,
    };

    return validatedPlan;
  }

  private validateStocks(stocks: any[]): Array<{
    symbol: string;
    name: string;
    allocation: number;
    sector: string;
    reasoning: string;
  }> {
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return this.getDefaultStocks();
    }

    // Ensure allocations sum to 100%
    const totalAllocation = stocks.reduce((sum, stock) => sum + (stock.allocation || 0), 0);
    if (totalAllocation !== 100) {
      // Normalize allocations
      stocks = stocks.map(stock => ({
        ...stock,
        allocation: Math.round((stock.allocation / totalAllocation) * 100)
      }));
    }

    return stocks.map(stock => ({
      symbol: stock.symbol || 'TCS.NS',
      name: stock.name || 'Default Stock',
      allocation: stock.allocation || 20,
      sector: stock.sector || 'Technology',
      reasoning: stock.reasoning || 'Selected for portfolio diversification',
    }));
  }

  private validateSteps(steps: any[]): Array<{
    step_number: number;
    title: string;
    description: string;
    actions: string[];
    timeline: string;
    expected_outcome: string;
  }> {
    if (!Array.isArray(steps) || steps.length === 0) {
      return this.getDefaultSteps();
    }

    return steps.map((step, index) => ({
      step_number: step.step_number || (index + 1),
      title: step.title || `Step ${index + 1}`,
      description: step.description || 'Complete this step to progress with your investment plan',
      actions: Array.isArray(step.actions) ? step.actions : ['Review and implement this step'],
      timeline: step.timeline || '1-2 weeks',
      expected_outcome: step.expected_outcome || 'Progress towards your investment goals',
    }));
  }

  private validateAllocation(allocation: any[]): Array<{
    assetClass: string;
    percentage: number;
    reasoning: string;
  }> {
    if (!Array.isArray(allocation) || allocation.length === 0) {
      return this.getDefaultAllocation();
    }

    // Ensure allocations sum to 100%
    const totalAllocation = allocation.reduce((sum, item) => sum + (item.percentage || 0), 0);
    if (totalAllocation !== 100) {
      // Normalize allocations
      allocation = allocation.map(item => ({
        ...item,
        percentage: Math.round((item.percentage / totalAllocation) * 100)
      }));
    }

    return allocation.map(item => ({
      assetClass: item.assetClass || 'Diversified Assets',
      percentage: item.percentage || 0,
      reasoning: item.reasoning || 'Portfolio diversification',
    }));
  }

  private validateSuggestions(suggestions: any[]): Array<{
    name: string;
    type: string;
    description: string;
    expectedReturn: string;
    riskLevel: string;
  }> {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return this.getDefaultSuggestions();
    }

    return suggestions.map(item => ({
      name: item.name || 'Investment Option',
      type: item.type || 'Asset',
      description: item.description || 'Recommended investment',
      expectedReturn: item.expectedReturn || 'Market Rate',
      riskLevel: item.riskLevel || 'Moderate',
    }));
  }

  private getDefaultAllocation() {
    return [
      { assetClass: 'Large Cap Stocks', percentage: 40, reasoning: 'Stability and steady growth' },
      { assetClass: 'Mid Cap Stocks', percentage: 20, reasoning: 'Higher growth potential' },
      { assetClass: 'Government Bonds', percentage: 20, reasoning: 'Capital preservation' },
      { assetClass: 'Gold/Commodities', percentage: 10, reasoning: 'Hedge against inflation' },
      { assetClass: 'Cash/Liquid Funds', percentage: 10, reasoning: 'Emergency liquidity' },
    ];
  }

  private getDefaultSuggestions() {
    return [
      {
        name: 'Nifty 50 ETF',
        type: 'ETF',
        description: 'Low-cost exposure to top 50 Indian companies',
        expectedReturn: '12-14%',
        riskLevel: 'Medium'
      },
      {
        name: 'HDFC Balanced Advantage Fund',
        type: 'Mutual Fund',
        description: 'Dynamic asset allocation for stability',
        expectedReturn: '10-12%',
        riskLevel: 'Low-Medium'
      },
      {
        name: 'Sovereign Gold Bonds',
        type: 'Government Bond',
        description: 'Safe gold investment with 2.5% extra interest',
        expectedReturn: 'Gold Price + 2.5%',
        riskLevel: 'Low'
      }
    ];
  }

  private getDefaultStocks() {
    return [
      {
        symbol: 'TCS.NS',
        name: 'Tata Consultancy Services',
        allocation: 25,
        sector: 'Information Technology',
        reasoning: 'As a 45-year-old IT major, TCS offers stability with 22% of revenue from North America. With their digital transformation focus and consistent 25%+ margins, it\'s a solid core holding for long-term growth.',
      },
      {
        symbol: 'HDFCBANK.NS',
        name: 'HDFC Bank',
        allocation: 20,
        sector: 'Banking & Financial Services',
        reasoning: 'HDFC Bank has shown remarkable recovery with 18% YoY advance growth. Their CASA ratio of 55% and low NPA of 0.4% make it a defensive play in the banking sector.',
      },
      {
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries',
        allocation: 20,
        sector: 'Energy & Conglomerate',
        reasoning: 'Reliance\'s Jio platform now contributes 60% of profits. With 5G rollout and retail expansion, it offers both stability and growth potential across multiple business verticals.',
      },
      {
        symbol: 'INFY.NS',
        name: 'Infosys',
        allocation: 20,
        sector: 'Information Technology',
        reasoning: 'Infosys has transformed under new leadership with focus on cloud and AI. Their 25% operating margin and strong order book provide visibility for steady earnings growth.',
      },
      {
        symbol: 'ITC.NS',
        name: 'ITC Limited',
        allocation: 15,
        sector: 'Consumer Goods & Conglomerate',
        reasoning: 'ITC\'s cigarette business provides steady cash flow while FMCG and paper divisions grow. With 45% of profits from non-cigarette businesses, it offers defensive qualities with growth.',
      },
    ];
  }

  private getDefaultSteps() {
    return [
      {
        step_number: 1,
        title: 'Set Up Your Investment Account',
        description: 'Before investing, you need a proper demat and trading account. I recommend choosing a broker with low brokerage fees.',
        actions: [
          'Compare brokers: Zerodha (₹20/order), Upstox (₹20/order), or Angel One (₹20/order)',
          'Complete online KYC with Aadhaar and PAN',
          'Link your bank account for seamless transactions',
          'Download the trading app and practice with virtual money'
        ],
        timeline: '1-2 weeks',
        expected_outcome: 'Fully functional trading account ready for investments',
        cost_implication: '₹300-500 one-time account opening + ₹100-300 annual maintenance'
      },
      {
        step_number: 2,
        title: 'Build Emergency Fund First',
        description: 'Never invest money you might need in the next 3-6 months. Keep 3-6 months of expenses as emergency fund.',
        actions: [
          'Calculate 3-6 months of essential expenses',
          'Keep this amount in liquid savings account or short-term FDs',
          'Separate emergency fund from investment corpus'
        ],
        timeline: '1-2 weeks',
        expected_outcome: 'Financial security buffer in place',
        cost_implication: 'None - this is precautionary savings'
      },
      {
        step_number: 3,
        title: 'Start with Systematic Investment Plan (SIP)',
        description: 'Rather than lump sum, use SIP to average out market volatility. This is especially good for regular income investors.',
        actions: [
          'Set up SIP for ₹5,000-10,000 monthly in recommended stocks',
          'Choose specific dates for SIP execution (7th or 12th of each month)',
          'Monitor SIP execution and adjust amounts as income grows'
        ],
        timeline: 'Ongoing - start immediately',
        expected_outcome: 'Regular investment habit established with rupee-cost averaging',
        cost_implication: '₹100-500 per SIP transaction (varies by broker)'
      },
      {
        step_number: 4,
        title: 'Invest Initial Capital Strategically',
        description: 'Use your initial capital to buy into the recommended stocks. Consider market timing - wait for corrections if possible.',
        actions: [
          'Transfer funds to trading account',
          'Place limit orders during market hours for better prices',
          'Start with 2-3 stocks from the recommended list',
          'Use market orders only during stable market conditions'
        ],
        timeline: '1-4 weeks',
        expected_outcome: 'Initial portfolio established with proper diversification',
        cost_implication: '₹20-100 per order + 0.003% transaction charges'
      },
      {
        step_number: 5,
        title: 'Set Up Regular Monitoring',
        description: 'Investing isn\'t "buy and forget". Regular review helps you stay on track and make adjustments.',
        actions: [
          'Review portfolio monthly during earnings season',
          'Track dividend payments and reinvest them',
          'Rebalance annually if allocations deviate by more than 5%',
          'Consider tax-loss harvesting opportunities'
        ],
        timeline: 'Monthly/Quarterly',
        expected_outcome: 'Well-maintained portfolio that adapts to changing conditions',
        cost_implication: 'Minimal - mostly time investment'
      },
      {
        step_number: 6,
        title: 'Plan for Taxes and Compliance',
        description: 'Indian tax laws affect your returns. Plan for LTCG, STCG, and keep proper records.',
        actions: [
          'Track purchase prices and dates for tax calculations',
          'Consider tax-saving investments if eligible',
          'File accurate tax returns with capital gains details',
          'Plan for indexation benefits on long-term holdings'
        ],
        timeline: 'Annual tax planning',
        expected_outcome: 'Tax-efficient portfolio with proper documentation',
        cost_implication: '₹5,000-15,000 annual tax filing + potential tax liability'
      }
    ];
  }

  private getFallbackPlan(
    questionnaireData: InvestmentQuestionnaireData,
    userProfile?: UserProfile
  ): InvestmentPlanOutput {
    const planTypeNames = {
      growth_accelerator: 'Growth Accelerator Plan',
      balanced_wealth_builder: 'Balanced Wealth Builder',
      conservative_income_generator: 'Conservative Income Generator'
    };

    const age = userProfile?.age || 35;
    const monthlyInvestment = userProfile ? Math.floor(userProfile.annual_income / 12) : 10000;
    const initialCapital = userProfile?.total_net_worth || 100000;

    return {
      plan_name: `${age < 35 ? 'Young Investor' : age < 50 ? 'Mid-Career' : 'Experienced Investor'} ${questionnaireData.riskComfort.charAt(0).toUpperCase() + questionnaireData.riskComfort.slice(1)} Strategy`,
      plan_type: questionnaireData.planType,
      description: `Based on your profile as a ${age}-year-old ${questionnaireData.experienceLevel} investor with ₹${monthlyInvestment.toLocaleString()} monthly capacity, I've designed this ${questionnaireData.riskComfort} risk strategy. You have ₹${initialCapital.toLocaleString()} to start with, and your ${questionnaireData.investmentHorizon} horizon gives us flexibility to be ${questionnaireData.riskComfort === 'low' ? 'conservative' : questionnaireData.riskComfort === 'high' ? 'aggressive' : 'balanced'} in our approach.`,
      risk_level: questionnaireData.riskComfort === 'high' ? 'high' : questionnaireData.riskComfort === 'low' ? 'low' : 'medium',
      expected_return: this.getExpectedReturn(questionnaireData, userProfile),
      recommended_stocks: this.getDefaultStocks(),
      allocation: this.getDefaultAllocation(),
      suggestions: this.getDefaultSuggestions(),
      steps: this.getDefaultSteps(),
      summary: `This isn't just any investment plan - it's tailored for someone exactly like you. With your ${questionnaireData.experienceLevel} background and focus on ${questionnaireData.financialGoals?.join(' and ') || 'wealth creation'}, we're building something sustainable. Remember, markets fluctuate, but disciplined investing with proper diversification has historically worked for investors with similar profiles.`,
      status: 'ok',
    };
  }

  private getExpectedReturn(questionnaireData: InvestmentQuestionnaireData, userProfile?: UserProfile): string {
    const baseReturns = {
      low: { min: 8, max: 12 },
      medium: { min: 12, max: 16 },
      high: { min: 16, max: 22 },
    };

    const riskReturn = baseReturns[questionnaireData.riskComfort as keyof typeof baseReturns] || baseReturns.medium;

    // Adjust based on experience and time horizon
    let adjustment = 0;

    if (questionnaireData.experienceLevel === 'Beginner') {
      adjustment -= 2; // More conservative for beginners
    } else if (questionnaireData.experienceLevel === 'Experienced') {
      adjustment += 1; // Slightly higher for experienced investors
    }

    if (questionnaireData.investmentHorizon === 'short') {
      adjustment -= 3; // Much more conservative for short term
    } else if (questionnaireData.investmentHorizon === 'long') {
      adjustment += 1; // Slightly higher for long term due to compounding
    }

    // Consider age - younger investors can take more risk
    const age = userProfile?.age || 35;
    if (age < 30) {
      adjustment += 1;
    } else if (age > 55) {
      adjustment -= 1;
    }

    const adjustedMin = Math.max(6, riskReturn.min + adjustment);
    const adjustedMax = Math.max(adjustedMin + 2, riskReturn.max + adjustment);

    return `${adjustedMin}-${adjustedMax}% annually, though past performance doesn't guarantee future returns`;
  }
}

// Export singleton instance
export const investmentPlanService = new InvestmentPlanService();