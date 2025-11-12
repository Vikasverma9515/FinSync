'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase'

export default function ProfileSetupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    age: '',
    riskTolerance: 'medium' as 'low' | 'medium' | 'high',
    investmentGoal: '',
    monthlyInvestment: '',
    initialCapital: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not found')
        return
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          age: parseInt(formData.age),
          risk_tolerance: formData.riskTolerance,
          investment_goal: formData.investmentGoal,
          monthly_investment: parseFloat(formData.monthlyInvestment),
          initial_capital: parseFloat(formData.initialCapital),
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              FinSync
            </span>
          </div>
          <p className="text-slate-400">Set up your investment profile</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {[1, 2, 3].map(num => (
                  <div key={num} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      num <= step 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {num}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {num === 1 ? 'Personal' : num === 2 ? 'Risk Profile' : 'Capital'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
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
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      What's your investment goal?
                    </label>
                    <textarea
                      name="investmentGoal"
                      value={formData.investmentGoal}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      placeholder="e.g., Long-term wealth creation, Early retirement, Education fund"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">
                      What's your risk tolerance?
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'low', label: 'Low Risk - Prefer stable investments', desc: 'Focus on bonds and dividend stocks' },
                        { value: 'medium', label: 'Medium Risk - Balanced approach', desc: 'Mix of stocks, bonds, and diversified assets' },
                        { value: 'high', label: 'High Risk - Aggressive growth', desc: 'Growth stocks and emerging opportunities' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center p-4 border border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors" style={{
                          backgroundColor: formData.riskTolerance === option.value ? 'rgba(16, 185, 129, 0.1)' : ''
                        }}>
                          <input
                            type="radio"
                            name="riskTolerance"
                            value={option.value}
                            checked={formData.riskTolerance === option.value}
                            onChange={handleChange}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <div className="ml-4">
                            <p className="text-white font-medium">{option.label}</p>
                            <p className="text-sm text-slate-400">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Initial Capital (₹)
                    </label>
                    <input
                      type="number"
                      name="initialCapital"
                      value={formData.initialCapital}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="e.g., 100000"
                    />
                    <p className="text-xs text-slate-400 mt-1">Starting amount you want to invest</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Monthly Investment (₹)
                    </label>
                    <input
                      type="number"
                      name="monthlyInvestment"
                      value={formData.monthlyInvestment}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="e.g., 10000"
                    />
                    <p className="text-xs text-slate-400 mt-1">How much you want to invest each month</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Setting up...</span>
                    </div>
                  ) : step === 3 ? (
                    'Complete Setup'
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
