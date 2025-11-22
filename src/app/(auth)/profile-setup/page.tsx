'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export default function ProfileSetupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])
  const [formData, setFormData] = useState({
    age: '',
    riskScore: '5',
    investmentHorizon: '',
    financialGoal: '1',
    financialCondition: '1',
    annualIncome: '',
    totalNetWorth: '',
    dependents: '0',
    investmentKnowledge: '1',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (!user) {
        setError('User not found')
        return
      }

      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          age: parseInt(formData.age),
          risk_score: parseInt(formData.riskScore),
          investment_horizon: parseInt(formData.investmentHorizon),
          financial_goal: parseInt(formData.financialGoal),
          financial_condition: parseInt(formData.financialCondition),
          annual_income: parseFloat(formData.annualIncome),
          total_net_worth: parseFloat(formData.totalNetWorth),
          dependents: parseInt(formData.dependents),
          investment_knowledge: parseInt(formData.investmentKnowledge),
          updated_at: new Date().toISOString(),
        })

      if (updateError) {
        setError(updateError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-blue-600 p-2.5 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              FinSync
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your investment journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((num, idx) => (
                <div key={num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      num <= step 
                        ? 'bg-blue-600 text-white' 
                        : num < step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {num < step ? <CheckCircle2 className="w-6 h-6" /> : num}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${
                      num <= step ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {num === 1 ? 'Personal' : num === 2 ? 'Financial' : 'Investment'}
                    </p>
                  </div>
                  {idx < 2 && (
                    <div className={`flex-1 h-1 mx-3 rounded-full ${
                      num < step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    What's your age?
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="100"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    How many dependents do you have?
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Annual Income (₹)
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 2000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Total Net Worth (₹)
                  </label>
                  <input
                    type="number"
                    name="totalNetWorth"
                    value={formData.totalNetWorth}
                    onChange={handleChange}
                    required
                    min="0"
                    step="100000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 10000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Risk Score (0-10)
                  </label>
                  <input
                    type="number"
                    name="riskScore"
                    value={formData.riskScore}
                    onChange={handleChange}
                    required
                    min="0"
                    max="10"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-gray-500 mt-2">0 = Conservative, 10 = Aggressive</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Investment Horizon (years)
                  </label>
                  <input
                    type="number"
                    name="investmentHorizon"
                    value={formData.investmentHorizon}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Investment Knowledge
                  </label>
                  <select
                    name="investmentKnowledge"
                    value={formData.investmentKnowledge}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Beginner</option>
                    <option value="2">2 - Basic</option>
                    <option value="3">3 - Intermediate</option>
                    <option value="4">4 - Advanced</option>
                    <option value="5">5 - Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Financial Goal
                  </label>
                  <select
                    name="financialGoal"
                    value={formData.financialGoal}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Capital Preservation</option>
                    <option value="2">2 - Steady Growth</option>
                    <option value="3">3 - Moderate Growth</option>
                    <option value="4">4 - Aggressive Growth</option>
                    <option value="5">5 - Maximum Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Financial Condition
                  </label>
                  <select
                    name="financialCondition"
                    value={formData.financialCondition}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Struggling</option>
                    <option value="2">2 - Stable</option>
                    <option value="3">3 - Comfortable</option>
                    <option value="4">4 - Affluent</option>
                    <option value="5">5 - Very Wealthy</option>
                  </select>
                </div>
              </div>
            )}

          <div className="flex gap-3 pt-8 border-t border-gray-200">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : step === 3 ? (
                'Complete Profile'
              ) : (
                'Next'
              )}
            </button>
          </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
