'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, CheckCircle2, X } from 'lucide-react'
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

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])
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
  const [portfolio, setPortfolio] = useState<Array<{
    symbol: string
    name: string
    quantity: string
    price: string
    date: string
  }>>([])
  const [currentPortfolioItem, setCurrentPortfolioItem] = useState({
    symbol: '',
    name: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentPortfolioItem(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'symbol' && value.length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      setIsSearching(true)
      setShowSearchResults(true)

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`)
          const data = await response.json()
          if (Array.isArray(data)) {
            setSearchResults(data)
          } else {
            setSearchResults([])
          }
        } catch (err) {
          console.error('Error searching stocks:', err)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else if (name === 'symbol' && value.length === 0) {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  const selectStock = (symbol: string, name: string) => {
    setCurrentPortfolioItem(prev => ({
      ...prev,
      symbol,
      name
    }))
    setShowSearchResults(false)
    setSearchResults([])
  }

  const addPortfolioItem = () => {
    if (!currentPortfolioItem.symbol || !currentPortfolioItem.name || !currentPortfolioItem.quantity || !currentPortfolioItem.price) {
      setError('Please fill all portfolio fields')
      return
    }
    setPortfolio(prev => [...prev, { ...currentPortfolioItem }])
    setCurrentPortfolioItem({
      symbol: '',
      name: '',
      quantity: '',
      price: '',
      date: new Date().toISOString().split('T')[0],
    })
    setError('')
  }

  const removePortfolioItem = (index: number) => {
    setPortfolio(prev => prev.filter((_, i) => i !== index))
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
        return
      }

      if (portfolio.length > 0) {
        const portfolioData = portfolio.map(item => ({
          user_id: user.id,
          symbol: item.symbol,
          name: item.name,
          quantity: parseInt(item.quantity),
          average_price: parseFloat(item.price),
          current_price: parseFloat(item.price),
          purchase_date: new Date(item.date).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const { error: portfolioError } = await supabase
          .from('portfolios')
          .insert(portfolioData)

        if (portfolioError) {
          setError(`Portfolio upload failed: ${portfolioError.message}`)
          return
        }
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
            <div className="bg-teal-400/10 p-2 md:p-2.5 rounded-lg border border-teal-400/30">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-teal-400" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">
              FinSync
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-sm md:text-base text-slate-400">Help us personalize your investment journey</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-navy-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-4 md:p-8 border border-slate-700/50"
        >
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((num, idx) => (
                <div key={num} className="flex items-center">
                  {/* Step Circle and Label */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-semibold text-sm md:text-lg transition-all shadow-lg ${num <= step
                      ? 'bg-teal-400 text-navy-900 shadow-teal-400/30'
                      : 'bg-navy-700/50 text-slate-500'
                      }`}>
                      {num < step ? <CheckCircle2 className="w-5 h-5 md:w-7 md:h-7" /> : num}
                    </div>
                    <p className={`text-xs md:text-sm mt-2 md:mt-3 font-medium whitespace-nowrap ${num <= step ? 'text-white' : 'text-slate-500'
                      }`}>
                      {num === 1 ? 'Personal' : num === 2 ? 'Financial' : 'Investment'}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {idx < 2 && (
                    <div className={`w-12 sm:w-32 h-0.5 md:h-1 mx-2 md:mx-4 rounded-full transition-all ${num < step ? 'bg-teal-400' : 'bg-navy-700/50'
                      }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {step === 1 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
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
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
                    How many dependents do you have?
                  </label>
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
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
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 2000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
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
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 10000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
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
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-slate-500 mt-2">0 = Conservative, 10 = Aggressive</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
                    Investment Horizon (years)
                  </label>
                  <input
                    type="number"
                    name="investmentHorizon"
                    value={formData.investmentHorizon}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
                    Investment Knowledge
                  </label>
                  <select
                    name="investmentKnowledge"
                    value={formData.investmentKnowledge}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Beginner</option>
                    <option value="2">2 - Basic</option>
                    <option value="3">3 - Intermediate</option>
                    <option value="4">4 - Advanced</option>
                    <option value="5">5 - Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
                    Financial Goal
                  </label>
                  <select
                    name="financialGoal"
                    value={formData.financialGoal}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Capital Preservation</option>
                    <option value="2">2 - Steady Growth</option>
                    <option value="3">3 - Moderate Growth</option>
                    <option value="4">4 - Aggressive Growth</option>
                    <option value="5">5 - Maximum Growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2 md:mb-3">
                    Financial Condition
                  </label>
                  <select
                    name="financialCondition"
                    value={formData.financialCondition}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-navy-700/50 border border-slate-600/50 rounded-lg text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="1">1 - Struggling</option>
                    <option value="2">2 - Stable</option>
                    <option value="3">3 - Comfortable</option>
                    <option value="4">4 - Affluent</option>
                    <option value="5">5 - Very Wealthy</option>
                  </select>
                </div>

                <div className="border-t border-slate-700/50 pt-6 mt-6">
                  <label className="block text-sm font-semibold text-white mb-4">
                    Your Portfolio (Optional)
                  </label>

                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs text-slate-400 mb-2">Symbol</label>
                        <input
                          type="text"
                          name="symbol"
                          value={currentPortfolioItem.symbol}
                          onChange={handlePortfolioChange}
                          placeholder="e.g., RELIANCE"
                          autoComplete="off"
                          className="w-full px-3 py-2 bg-navy-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                        />
                        {showSearchResults && currentPortfolioItem.symbol && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-slate-600 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                            {isSearching ? (
                              <div className="p-3 text-center text-sm text-slate-400">Searching...</div>
                            ) : searchResults.length > 0 ? (
                              searchResults.map((result, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => selectStock(result.symbol, result.name)}
                                  className="w-full px-3 py-2 text-left hover:bg-navy-700/50 border-b border-slate-700/50 last:border-b-0 transition-colors"
                                >
                                  <p className="text-sm font-semibold text-white">{result.symbol}</p>
                                  <p className="text-xs text-slate-400">{result.name}</p>
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-center text-sm text-slate-400">No stocks found</div>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Company Name</label>
                        <input
                          type="text"
                          name="name"
                          value={currentPortfolioItem.name}
                          readOnly
                          placeholder="Auto-filled from search"
                          className="w-full px-3 py-2 bg-navy-700/30 border border-slate-600/30 rounded-lg text-sm text-slate-400 placeholder-slate-500 focus:outline-none transition-all cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={currentPortfolioItem.quantity}
                          onChange={handlePortfolioChange}
                          placeholder="e.g., 50"
                          min="1"
                          className="w-full px-3 py-2 bg-navy-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          name="price"
                          value={currentPortfolioItem.price}
                          onChange={handlePortfolioChange}
                          placeholder="e.g., 2850.50"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 bg-navy-700/50 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs text-slate-400 mb-2">Purchase Date</label>
                        <input
                          type="date"
                          name="date"
                          value={currentPortfolioItem.date}
                          onChange={handlePortfolioChange}
                          className="w-full px-3 py-2 bg-navy-700/50 border border-slate-600/50 rounded-lg text-sm text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addPortfolioItem}
                      className="w-full px-4 py-2 bg-navy-700/50 text-white text-sm font-medium rounded-lg hover:bg-navy-600 transition-colors"
                    >
                      Add Stock to Portfolio
                    </button>
                  </div>

                  {portfolio.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-400">Stocks Added ({portfolio.length})</p>
                      {portfolio.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-navy-700/30 p-3 rounded-lg border border-slate-600/30">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{item.symbol} - {item.name}</p>
                            <p className="text-xs text-slate-400">{item.quantity} shares @ ₹{item.price}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePortfolioItem(index)}
                            className="ml-2 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-8 border-t border-slate-700/50">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-navy-700/50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-teal-400 text-navy-900 font-semibold rounded-lg hover:bg-teal-300 disabled:opacity-75 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
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
