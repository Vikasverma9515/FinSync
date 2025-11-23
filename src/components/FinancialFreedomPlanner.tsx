'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  PieChart,
  MessageCircle,
  Send,
  Sparkles,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
  generateFinancialFreedomPlan,
  getFinancialCoachResponse,
  generateCoachWelcomeMessage,
} from '../lib/financialFreedomPlanner'
import WealthGrowthChart from './charts/WealthGrowthChart'
import AssetAllocationChart from './charts/AssetAllocationChart'
import MonthlyProjectionTable from './charts/MonthlyProjectionTable'
import AnimatedCounter from './AnimatedCounter'
import BudgetRuleCard from './BudgetRuleCard'
import ActionPlan from './ActionPlan'
import SavingsTipsCard from './SavingsTipsCard'
import type {
  FinancialFreedomInputs,
  FinancialFreedomPlan,
  FinancialCoachMessage,
} from '../types'

interface FinancialFreedomPlannerProps {
  onBack: () => void
}

const FinancialFreedomPlanner: React.FC<FinancialFreedomPlannerProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [resultsView, setResultsView] = useState<'results' | 'coach'>('results')
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    monthlyExpenses: '',
    savingsGoal: '',
    timeHorizon: '',
    riskPreference: '',
    currentSavings: '',
  })
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Coach state
  const [coachMessages, setCoachMessages] = useState<FinancialCoachMessage[]>([])
  const [coachInput, setCoachInput] = useState('')
  const [isCoachTyping, setIsCoachTyping] = useState(false)

  const totalSteps = 6

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      await generatePlan()
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.monthlyIncome !== ''
      case 2: return formData.monthlyExpenses !== ''
      case 3: return formData.savingsGoal !== ''
      case 4: return formData.timeHorizon !== ''
      case 5: return formData.riskPreference !== ''
      case 6: return formData.currentSavings !== ''
      default: return true
    }
  }

  const getCompletionPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100)
  }

  const stepTitles = {
    1: "Monthly Income",
    2: "Monthly Expenses",
    3: "Savings Goal",
    4: "Time Horizon",
    5: "Risk Preference",
    6: "Current Savings",
  }

  const stepDescriptions = {
    1: "What's your total monthly income after taxes?",
    2: "How much do you spend monthly on all expenses?",
    3: "What's your target savings amount for financial freedom?",
    4: "How many years do you have to achieve this goal?",
    5: "What's your comfort level with investment risk?",
    6: "How much do you currently have saved?",
  }

  const parseAIResponse = (aiResponse: string) => {
    // Clean the response to ensure it's valid JSON
    let cleanedResponse = aiResponse.trim()

    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

    // Try to find JSON object in the response if it's embedded in text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0]
    }

    try {
      return JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Cleaned response:', cleanedResponse)
      throw parseError
    }
  }

  const generateFallbackPlan = (formData: any) => {
    const monthlyIncome = parseFloat(formData.monthlyIncome)
    const monthlyExpenses = parseFloat(formData.monthlyExpenses)
    const savingsGoal = parseFloat(formData.savingsGoal)
    const timeHorizon = parseInt(formData.timeHorizon)
    const currentSavings = parseFloat(formData.currentSavings)
    const monthlySavings = monthlyIncome - monthlyExpenses

    const returnRate = formData.riskPreference === 'low' ? 0.06 : formData.riskPreference === 'medium' ? 0.08 : 0.10
    const savingsRate = monthlySavings / monthlyIncome

    // Calculate wealth path
    let totalWealth = currentSavings
    const yearlyTargets = []

    for (let year = 1; year <= timeHorizon; year++) {
      totalWealth = totalWealth * (1 + returnRate) + (monthlySavings * 12)
      const passiveIncome = totalWealth * 0.04 / 12 // 4% safe withdrawal rate

      yearlyTargets.push({
        year,
        totalWealth: Math.round(totalWealth),
        passiveIncome: Math.round(passiveIncome)
      })
    }

    // Calculate freedom score
    const savingsRateScore = Math.min(savingsRate * 100, 100)
    const timeHorizonScore = Math.min(timeHorizon * 5, 100)
    const goalFeasibilityScore = totalWealth >= savingsGoal ? 100 : (totalWealth / savingsGoal) * 100
    const riskScore = formData.riskPreference === 'medium' ? 80 : formData.riskPreference === 'high' ? 60 : 100

    const freedomScore = Math.round((savingsRateScore + timeHorizonScore + goalFeasibilityScore + riskScore) / 4)

    return {
      wealthPathMap: {
        totalYears: timeHorizon,
        finalWealth: Math.round(totalWealth),
        yearlyTargets
      },
      freedomScore: {
        score: freedomScore,
        level: freedomScore >= 80 ? 'advanced' : freedomScore >= 60 ? 'intermediate' : 'beginner',
        nextMilestone: freedomScore >= 80 ? 'Financial independence achieved!' : 'Increase savings rate to 20%',
        factors: {
          savingsRate: Math.round(savingsRateScore),
          timeHorizon: Math.round(timeHorizonScore),
          riskManagement: riskScore,
          goalFeasibility: Math.round(goalFeasibilityScore)
        }
      },
      insights: [
        {
          type: savingsRate > 0.2 ? 'achievement' : savingsRate > 0.1 ? 'opportunity' : 'warning',
          title: savingsRate > 0.2 ? 'Excellent savings rate!' : 'Consider increasing savings',
          description: `You're saving ${(savingsRate * 100).toFixed(1)}% of your income. Aim for 20% for better results.`
        },
        {
          type: totalWealth >= savingsGoal ? 'achievement' : 'opportunity',
          title: totalWealth >= savingsGoal ? 'Goal achievable!' : 'Goal may need adjustment',
          description: `With your current plan, you'll have ₹${Math.round(totalWealth).toLocaleString()} in ${timeHorizon} years.`
        },
        {
          type: 'opportunity',
          title: 'Investment strategy',
          description: `Using ${formData.riskPreference} risk approach with ${(returnRate * 100).toFixed(0)}% expected return.`
        }
      ],
      summary: `Based on your ₹${monthlyIncome.toLocaleString()} monthly income and ₹${monthlyExpenses.toLocaleString()} expenses, you can save ₹${monthlySavings.toLocaleString()} monthly. With ${timeHorizon} years and ${formData.riskPreference} risk tolerance, you could accumulate ₹${Math.round(totalWealth).toLocaleString()} and achieve a freedom score of ${freedomScore}/100.`
    }
  }

  const generatePlan = async () => {
    setIsLoading(true)
    setError(null)
    setShowResults(true)
    setGeneratedPlan(null)

    try {
      const response = await fetch('/api/ai/financial-freedom-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyIncome: parseFloat(formData.monthlyIncome),
          monthlyExpenses: parseFloat(formData.monthlyExpenses),
          savingsGoal: parseFloat(formData.savingsGoal),
          timeHorizon: parseInt(formData.timeHorizon),
          riskPreference: formData.riskPreference,
          currentSavings: parseFloat(formData.currentSavings),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`API error: ${response.status} - ${errorData.error}${errorData.details ? ': ' + errorData.details : ''}`)
      }

      const planData = await response.json()

      setGeneratedPlan(planData)

      // Initialize coach with welcome message
      const welcomeMessage = generateCoachWelcomeMessage(planData)
      setCoachMessages([welcomeMessage])
    } catch (error) {
      console.error('Error generating plan:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setGeneratedPlan(null)
      setShowResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coachInput.trim() || !generatedPlan) return

    const userMessage: FinancialCoachMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: coachInput,
      timestamp: new Date().toISOString(),
    }

    setCoachMessages(prev => [...prev, userMessage])
    setCoachInput('')
    setIsCoachTyping(true)

    try {
      const response = await getFinancialCoachResponse(coachInput, generatedPlan, coachMessages)

      const assistantMessage: FinancialCoachMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions,
      }

      setCoachMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Coach error:', error)
    } finally {
      setIsCoachTyping(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'achievement': return <Trophy className="w-5 h-5 text-emerald-500" />
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-blue-500" />
      default: return <CheckCircle className="w-5 h-5 text-slate-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-amber-200 bg-amber-50'
      case 'achievement': return 'border-emerald-200 bg-emerald-50'
      case 'opportunity': return 'border-blue-200 bg-blue-50'
      default: return 'border-slate-200 bg-slate-50'
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy-900 p-4">
        <div className="max-w-4xl mx-auto py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-rose-500 mb-4">Error Generating Plan</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={() => setError(null)}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 p-4">
        <div className="max-w-4xl mx-auto py-20">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-full mb-8 flex items-center justify-center"
              style={{ backgroundColor: "rgba(100, 255, 218, 0.1)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <PieChart className="w-10 h-10 text-teal-400" />
            </motion.div>

            <motion.div
              className="text-center max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2
                className="text-3xl mb-4"
                style={{
                  color: "#ffffff",
                  fontWeight: "400",
                  letterSpacing: "-0.01em",
                }}
              >
                Creating Your Freedom Plan
              </h2>
              <p
                className="text-lg"
                style={{
                  color: "#94a3b8",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                Our AI is crafting a personalized financial freedom strategy based on your inputs...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults && generatedPlan) {
    return (
      <div className="min-h-screen bg-navy-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-teal-400" />
                Your Financial Freedom Plan
              </h1>
              <p className="text-slate-400">AI-generated personalized roadmap to financial independence</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'results', label: 'Your Plan', icon: TrendingUp },
              { key: 'coach', label: 'AI Coach', icon: MessageCircle },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={resultsView === key ? 'default' : 'outline'}
                onClick={() => setResultsView(key as 'results' | 'coach')}
                className={`flex items-center gap-2 ${resultsView === key ? 'bg-teal-500 text-navy-900' : 'text-slate-400 border-slate-700 hover:text-white hover:bg-navy-800'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {resultsView === 'results' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Key Metrics - Animated */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-8 h-8 text-teal-400" />
                          <div className="text-xs font-medium text-teal-400 bg-teal-500/20 px-2 py-1 rounded">
                            Final Wealth
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          <AnimatedCounter
                            value={generatedPlan.wealthPathMap?.finalWealth || generatedPlan.yearlyTargets?.[generatedPlan.yearlyTargets.length - 1]?.netWorth || 0}
                            prefix="₹"
                            duration={2.5}
                          />
                        </div>
                        <p className="text-sm text-slate-400">
                          in {generatedPlan.wealthPathMap?.totalYears || formData.timeHorizon} years
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="w-8 h-8 text-blue-400" />
                          <div className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                            Monthly Savings
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          <AnimatedCounter
                            value={generatedPlan.monthlySavingsNeeded || (parseFloat(formData.monthlyIncome) - parseFloat(formData.monthlyExpenses))}
                            prefix="₹"
                            duration={2}
                          />
                        </div>
                        <p className="text-sm text-slate-400">
                          to reach your goal
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/30">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <TrendingUp className="w-8 h-8 text-amber-400" />
                          <div className="text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                            Passive Income
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">
                          <AnimatedCounter
                            value={(generatedPlan.wealthPathMap?.yearlyTargets?.[generatedPlan.wealthPathMap.yearlyTargets.length - 1]?.passiveIncome || generatedPlan.yearlyTargets?.[generatedPlan.yearlyTargets.length - 1]?.passiveIncome || 0) / 12}
                            prefix="₹"
                            duration={2.2}
                          />
                        </div>
                        <p className="text-sm text-slate-400">
                          per month (final year)
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Summary */}
                <Card className="bg-navy-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="text-white">Your Financial Freedom Plan</CardTitle>
                    <CardDescription className="text-slate-400">{generatedPlan.summary}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Freedom Score */}
                <Card className="bg-navy-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Trophy className="w-5 h-5 text-teal-400" />
                      Freedom Score: {generatedPlan.freedomScore?.score || 0}/100
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Level: {generatedPlan.freedomScore?.level || 'N/A'} • Next milestone: {generatedPlan.freedomScore?.nextMilestone || 'Continue your journey'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(generatedPlan.freedomScore?.factors || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="text-center">
                          <div className="text-2xl font-bold text-teal-400">{value}</div>
                          <div className="text-sm text-slate-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Wealth Growth Visualization */}
                <Card className="bg-navy-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-teal-400" />
                      Wealth Growth Projection
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Your journey to ₹{generatedPlan.wealthPathMap?.finalWealth?.toLocaleString() || '0'} over {generatedPlan.wealthPathMap?.totalYears || 0} years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WealthGrowthChart
                      data={generatedPlan.wealthPathMap?.yearlyTargets || generatedPlan.yearlyTargets || []}
                      savingsGoal={parseFloat(formData.savingsGoal)}
                    />
                  </CardContent>
                </Card>

                {/* Asset Allocation */}
                {(generatedPlan.wealthPathMap?.yearlyTargets?.[0]?.investmentAllocation || generatedPlan.investmentAllocation) && (
                  <Card className="bg-navy-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <PieChart className="w-5 h-5 text-teal-400" />
                        Recommended Asset Allocation
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Diversified portfolio based on your {formData.riskPreference} risk preference
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AssetAllocationChart
                        allocation={generatedPlan.wealthPathMap?.yearlyTargets?.[0]?.investmentAllocation || generatedPlan.investmentAllocation}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Monthly Breakdown - First Year */}
                {generatedPlan.wealthPathMap?.monthlyBreakdown && (
                  <Card className="bg-navy-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Clock className="w-5 h-5 text-teal-400" />
                        First Year Monthly Breakdown
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Month-by-month savings and wealth accumulation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MonthlyProjectionTable data={generatedPlan.wealthPathMap.monthlyBreakdown} />
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                <Card className="bg-navy-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Lightbulb className="w-5 h-5 text-teal-400" />
                      Personalized Insights
                    </CardTitle>
                    <CardDescription className="text-slate-400">AI-generated recommendations for your financial journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(generatedPlan.insights || []).map((insight: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border ${insight.type === 'warning' ? 'border-amber-500/20 bg-amber-500/10' :
                          insight.type === 'achievement' ? 'border-teal-500/20 bg-teal-500/10' :
                            'border-blue-500/20 bg-blue-500/10'
                          }`}>
                          <div className="flex items-start gap-3">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <h3 className="font-medium text-white mb-1">{insight.title}</h3>
                              <p className="text-sm text-slate-400">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Rule - 50/30/20 */}
                <BudgetRuleCard
                  monthlyIncome={parseFloat(formData.monthlyIncome)}
                  monthlyExpenses={parseFloat(formData.monthlyExpenses)}
                />

                {/* Action Plan */}
                <ActionPlan
                  monthlyIncome={parseFloat(formData.monthlyIncome)}
                  monthlyExpenses={parseFloat(formData.monthlyExpenses)}
                  savingsGoal={parseFloat(formData.savingsGoal)}
                  timeHorizon={parseInt(formData.timeHorizon)}
                  currentSavings={parseFloat(formData.currentSavings) || 0}
                />

                {/* Savings Tips */}
                <SavingsTipsCard
                  monthlyIncome={parseFloat(formData.monthlyIncome)}
                />
              </motion.div>
            )}

            {resultsView === 'coach' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Coach Interface */}
                <Card className="bg-navy-800/50 border-slate-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <MessageCircle className="w-5 h-5 text-teal-400" />
                      AI Financial Coach
                    </CardTitle>
                    <CardDescription className="text-slate-400">Get personalized advice and stay motivated on your journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto mb-4 custom-scrollbar">
                      {coachMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                            ? 'bg-teal-500 text-navy-900'
                            : 'bg-navy-900 border border-slate-700 text-slate-200'
                            }`}>
                            <p className="text-sm">{message.content}</p>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.suggestions.map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setCoachInput(suggestion)}
                                    className="block text-xs underline hover:no-underline opacity-80 hover:opacity-100"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {isCoachTyping && (
                        <div className="flex justify-start">
                          <div className="bg-navy-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-slate-400">Maya is typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coachInput}
                        onChange={(e) => setCoachInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCoachSubmit(e as any)}
                        placeholder="Ask Maya anything about your financial plan..."
                        className="flex-1 p-3 bg-navy-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <Button onClick={handleCoachSubmit} disabled={!coachInput.trim() || isCoachTyping} className="bg-teal-500 hover:bg-teal-600 text-navy-900">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Questionnaire Steps
  return (
    <div className="min-h-screen bg-navy-900 p-4">
      <div className="max-w-4xl mx-auto py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-teal-400" />
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Financial Freedom Planner
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Answer a few questions and we'll create a personalized financial freedom plan tailored to your goals.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-slate-400">
              {getCompletionPercentage()}% Complete
            </span>
          </div>
          <div className="w-full bg-navy-800 rounded-full h-2">
            <div
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-navy-800/50 rounded-2xl shadow-sm border border-slate-700/50 p-6 lg:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
                {stepTitles[currentStep as keyof typeof stepTitles]}
              </h2>
              <p className="text-slate-400">
                {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
              </p>
            </div>

            {/* Step 1: Monthly Income */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  placeholder="e.g., 50000"
                  className="w-full p-4 text-lg bg-navy-900 border-2 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-500"
                />
                <p className="text-sm text-slate-400">Enter your total monthly income after taxes and deductions</p>
              </div>
            )}

            {/* Step 2: Monthly Expenses */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <input
                  type="number"
                  value={formData.monthlyExpenses}
                  onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                  placeholder="e.g., 35000"
                  className="w-full p-4 text-lg bg-navy-900 border-2 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-500"
                />
                <p className="text-sm text-slate-400">Include rent, utilities, groceries, transportation, and other regular expenses</p>
              </div>
            )}

            {/* Step 3: Savings Goal */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <input
                  type="number"
                  value={formData.savingsGoal}
                  onChange={(e) => handleInputChange('savingsGoal', e.target.value)}
                  placeholder="e.g., 50000000"
                  className="w-full p-4 text-lg bg-navy-900 border-2 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-500"
                />
                <p className="text-sm text-slate-400">The total amount you want to accumulate for financial freedom</p>
              </div>
            )}

            {/* Step 4: Time Horizon */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <input
                  type="number"
                  value={formData.timeHorizon}
                  onChange={(e) => handleInputChange('timeHorizon', e.target.value)}
                  placeholder="e.g., 10"
                  min="1"
                  max="50"
                  className="w-full p-4 text-lg bg-navy-900 border-2 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-500"
                />
                <p className="text-sm text-slate-400">How many years do you have to achieve your savings goal?</p>
              </div>
            )}

            {/* Step 5: Risk Preference */}
            {currentStep === 5 && (
              <div className="space-y-4">
                {[
                  { value: "low", label: "Conservative", description: "Lower risk, lower returns - prioritize capital preservation" },
                  { value: "medium", label: "Balanced", description: "Moderate risk, moderate returns - balance growth and stability" },
                  { value: "high", label: "Aggressive", description: "Higher risk, higher returns - focus on maximum growth potential" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleInputChange('riskPreference', option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.riskPreference === option.value
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600"
                      }`}
                  >
                    <div className="font-bold text-lg text-white mb-1">{option.label}</div>
                    <div className="text-slate-400">{option.description}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Current Savings */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <input
                  type="number"
                  value={formData.currentSavings}
                  onChange={(e) => handleInputChange('currentSavings', e.target.value)}
                  placeholder="e.g., 100000"
                  className="w-full p-4 text-lg bg-navy-900 border-2 border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-slate-500"
                />
                <p className="text-sm text-slate-400">How much do you currently have saved or invested?</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          className="flex items-center justify-between mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={currentStep === 1 ? onBack : prevStep}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </Button>

          <Button
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-navy-900"
          >
            {currentStep === totalSteps ? "Generate Plan" : "Next"}
            {currentStep !== totalSteps && <ArrowRight className="w-4 h-4" />}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default FinancialFreedomPlanner