'use server'

import { investmentPlanService } from './ai/services/investmentPlanService'
import type { InvestmentQuestionnaireData, UserProfile, InvestmentPlanOutput } from '../types'

export async function generateInvestmentPlan(
  formData: InvestmentQuestionnaireData,
  profile: UserProfile
): Promise<InvestmentPlanOutput> {
  const response = await investmentPlanService.generatePersonalizedPlan(formData, profile)

  if (!response.success) {
    throw new Error(response.error || 'Failed to generate investment plan')
  }

  return response.data
}