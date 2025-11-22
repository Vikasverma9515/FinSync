'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp, TrendingDown, DollarSign, Search, BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { StockSearchDialog } from '@/components/StockSearchDialog'
import { getPopularStocks, getStockQuote, getPredictData } from '@/lib/stocks'
import type { UserProfile, Portfolio } from '@/types'
import type { StockQuote, PredictResponse } from '@/lib/stocks'
import Header from '@/components/Header'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [holdings, setHoldings] = useState<(Portfolio & { quote?: StockQuote })[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [marketStocks, setMarketStocks] = useState<StockQuote[]>([])
  const [customStocks, setCustomStocks] = useState<StockQuote[]>([])
  const [profitLoss, setProfitLoss] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string>('')
  const [predictData, setPredictData] = useState<PredictResponse | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (loading) return

      if (!user) {
        router.push('/login')
        return
      }

      const supabase = createClient()

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData) {
        router.push('/profile-setup')
        return
      }

      setProfile(profileData)

      const { data: holdingsData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)

      setHoldings(holdingsData || [])

      // Create user in custom API with actual portfolio holdings
      try {
        const portfolioData = holdingsData?.map((holding: any) => {
          const purchaseDate = holding.purchase_date 
            ? new Date(holding.purchase_date).toISOString()
            : new Date().toISOString()
          
          return {
            companyName: holding.name || holding.symbol,
            symbol: holding.symbol,
            number: holding.quantity,
            date: purchaseDate,
            price: holding.average_price,
          }
        }) || []

        const newUserData = {
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          password: user.id,
          portfolio: portfolioData,
          Age: profileData.age || 32,
          RiskScore: profileData.risk_score || 7,
          InvestmentHorizon: profileData.investment_horizon || 20,
          FinancialGoal: 2,
          FinancialCondition: 2,
          AnnualIncome: profileData.annual_income || 2000000,
          TotalNetWorth: profileData.net_worth || 10000000,
          Dependents: profileData.dependents || 3,
          InvestmentKnowledge: profileData.investment_knowledge || 2
        }

        await fetch('/api/user/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUserData),
        })

        // Login to get token
        console.log('Attempting login with email:', user.email)
        const loginResponse = await fetch('/api/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: user.id,
          }),
        })

        console.log('Login response status:', loginResponse.status)
        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          console.log('Login response data:', loginData)
          const token = loginData.token
          console.log('Token extracted:', token)
          if (token) {
            setAuthToken(token)
          }
        } else {
          const errorText = await loginResponse.text()
          console.error('Login failed:', loginResponse.status, errorText)
        }
      } catch (error) {
        console.error('Failed to create/login user in custom API:', error)
      }

      // Load market stocks (will be called again when authToken updates)
      const loadMarketStocks = async (token: string) => {
        try {
          const popularStocks = getPopularStocks()
          const marketData = await Promise.all(
            popularStocks.slice(0, 8).map(async (symbol) => {
              try {
                const headers: Record<string, string> = {}
                if (token) {
                  headers['Authorization'] = `Bearer ${token}`
                }
                const response = await fetch(`/api/stocks/quote?symbol=${symbol}`, { headers })
                if (response.ok) {
                  return await response.json()
                }
                return null
              } catch {
                return null
              }
            })
          )
          setMarketStocks(marketData.filter(Boolean) as StockQuote[])
        } catch (error) {
          console.error('Failed to load market data:', error)
        }
      }

      // Load custom stocks (will be called again when authToken updates)
      const loadCustomStocks = async (token: string) => {
        try {
          const portfolioSymbols = holdingsData?.map((h: any) => h.symbol) || ['RELIANCE', 'TCS', 'INFY']
          const customData = await Promise.all(
            portfolioSymbols.map(async (symbol) => {
              try {
                const headers: Record<string, string> = {}
                if (token) {
                  headers['Authorization'] = `Bearer ${token}`
                }
                const response = await fetch(`/api/stocks/quote?symbol=${symbol}`, { headers })
                if (response.ok) {
                  return await response.json()
                }
                return null
              } catch {
                return null
              }
            })
          )
          setCustomStocks(customData.filter(Boolean) as StockQuote[])
        } catch (error) {
          console.error('Failed to load custom stocks:', error)
        }
      }

      // Load profit/loss (will be called again when authToken updates)
      const loadProfitLoss = async (token: string) => {
        try {
          const headers: Record<string, string> = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          const response = await fetch('/api/profit-loss', { headers })
          if (response.ok) {
            const data = await response.json()
            setProfitLoss(data)
          }
        } catch (error) {
          console.error('Failed to load profit/loss:', error)
        }
      }

      // Will load authenticated data after token is available


    }

    loadData()
  }, [user, loading, router])

  // Load authenticated data when authToken is available
  useEffect(() => {
    if (!authToken) {
      console.log('No auth token available yet')
      return
    }

    console.log('Auth token received:', authToken)

    const loadAuthenticatedData = async () => {
      const loadMarketStocks = async (token: string) => {
        try {
          console.log('Loading market stocks...')
          const popularStocks = getPopularStocks()
          const marketData = await Promise.all(
            popularStocks.slice(0, 8).map(async (symbol) => {
              try {
                const headers: Record<string, string> = {
                  'Authorization': `Bearer ${token}`
                }
                const response = await fetch(`/api/stocks/quote?symbol=${symbol}`, { headers })
                if (response.ok) {
                  return await response.json()
                }
                console.warn(`Failed to load ${symbol}: ${response.status}`)
                return null
              } catch (error) {
                console.error(`Error loading ${symbol}:`, error)
                return null
              }
            })
          )
          const filtered = marketData.filter(Boolean) as StockQuote[]
          console.log('Market stocks loaded:', filtered)
          setMarketStocks(filtered)
        } catch (error) {
          console.error('Failed to load market data:', error)
        }
      }

      const loadCustomStocks = async (token: string) => {
        try {
          console.log('Loading custom stocks...')
          const portfolioSymbols = holdings?.map((h: any) => h.symbol) || ['RELIANCE', 'TCS', 'INFY']
          console.log('Portfolio symbols:', portfolioSymbols)
          const customData = await Promise.all(
            portfolioSymbols.map(async (symbol) => {
              try {
                const headers: Record<string, string> = {
                  'Authorization': `Bearer ${token}`
                }
                const response = await fetch(`/api/stocks/quote?symbol=${symbol}`, { headers })
                if (response.ok) {
                  return await response.json()
                }
                console.warn(`Failed to load ${symbol}: ${response.status}`)
                return null
              } catch (error) {
                console.error(`Error loading ${symbol}:`, error)
                return null
              }
            })
          )
          const filtered = customData.filter(Boolean) as StockQuote[]
          console.log('Custom stocks loaded:', filtered)
          setCustomStocks(filtered)
        } catch (error) {
          console.error('Failed to load custom stocks:', error)
        }
      }

      const loadProfitLoss = async (token: string) => {
        try {
          console.log('Loading profit/loss...')
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
          }
          const response = await fetch('/api/profit-loss', { headers })
          if (response.ok) {
            const data = await response.json()
            console.log('Profit/Loss data:', data)
            setProfitLoss(data)
          } else {
            console.warn(`Failed to load profit/loss: ${response.status}`)
            const errorText = await response.text()
            console.error('Error response:', errorText)
          }
        } catch (error) {
          console.error('Failed to load profit/loss:', error)
        }
      }

      const loadPredictData = async (token: string) => {
        try {
          console.log('Loading predict data...')
          if (!profile) {
            console.warn('Profile not available for predict data')
            return
          }

          const userProfileData = {
            Age: profile.age,
            RiskScore: profile.risk_score,
            InvestmentHorizon: profile.investment_horizon,
            FinancialGoal: profile.financial_goal,
            FinancialCondition: profile.financial_condition,
            AnnualIncome: profile.annual_income,
            TotalNetWorth: profile.total_net_worth,
            Dependents: profile.dependents,
            InvestmentKnowledge: profile.investment_knowledge
          }

          const data = await getPredictData(userProfileData, token)
          if (data) {
            console.log('Predict data:', data)
            setPredictData(data)
          }
        } catch (error) {
          console.error('Failed to load predict data:', error)
        }
      }

      await loadMarketStocks(authToken)
      await loadCustomStocks(authToken)
      await loadProfitLoss(authToken)
      await loadPredictData(authToken)
      setIsLoading(false)
    }

    loadAuthenticatedData()
  }, [authToken, holdings, profile])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalPortfolioValue = holdings.reduce(
    (sum, h) => sum + h.quantity * (h.current_price || 0),
    0
  )

  const totalCost = holdings.reduce(
    (sum, h) => sum + h.quantity * h.average_price,
    0
  )



  const totalGain = totalPortfolioValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">FinSync</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav> */}
      <Header />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Portfolio Overview
              </h2>
              <p className="text-slate-600">
                Risk Score: {profile?.risk_score} • {profile?.age} years old
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Total Value</h3>
                <DollarSign className="w-5 h-5 text-slate-900" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                ₹{totalPortfolioValue.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}₹{totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Total Invested</h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                ₹{totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600">
                Base investment
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Market Stocks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-slate-900" />
              Popular Stocks
            </h3>
            <Button
              onClick={() => setShowSearch(true)}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Stock
            </Button>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <div className="space-y-3">
              {marketStocks.slice(0, 6).map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-slate-900 font-medium">{stock.name}</p>
                    <p className="text-slate-600 text-sm">{stock.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 font-semibold">₹{stock.price.toFixed(2)}</p>
                    <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Custom Stock Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Stock Details</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom Stocks */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Stocks</h4>
              <div className="space-y-3">
                {customStocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <p className="text-slate-900 font-medium">{stock.name}</p>
                      <p className="text-slate-600 text-sm">{stock.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 font-semibold">₹{stock.price.toFixed(2)}</p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Profit/Loss */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Profit/Loss by Stock</h4>
              {profitLoss ? (
                <div className="space-y-3">
                  {profitLoss.rawData && profitLoss.rawData.data && Array.isArray(profitLoss.rawData.data) ? (
                    <>
                      {profitLoss.rawData.data.map((stock: any) => {
                        const totalInvested = holdings.find(h => h.symbol === stock.symbol)
                          ? holdings.find(h => h.symbol === stock.symbol)!.quantity * holdings.find(h => h.symbol === stock.symbol)!.average_price
                          : 0
                        const profitPercent = totalInvested > 0 ? (stock.profit / totalInvested) * 100 : 0
                        return (
                          <div key={stock.symbol} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-slate-900 font-medium">{stock.symbol}</p>
                              <p className={`text-sm font-bold ${stock.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stock.profit >= 0 ? '+' : ''}₹{stock.profit.toFixed(2)}
                              </p>
                            </div>
                            <p className={`text-xs ${profitPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                            </p>
                          </div>
                        )
                      })}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
                        <p className="text-slate-600 text-sm font-medium">Total Profit/Loss</p>
                        <p className={`text-lg font-bold ${profitLoss.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {profitLoss.totalProfit >= 0 ? '+' : ''}₹{profitLoss.totalProfit.toFixed(2)}
                        </p>
                        <p className={`text-xs mt-1 ${profitLoss.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {profitLoss.percentage >= 0 ? '+' : ''}{profitLoss.percentage.toFixed(2)}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600 text-sm">No profit/loss data available</div>
                  )}
                </div>
              ) : (
                <div className="text-slate-600 text-sm">Loading profit/loss data...</div>
              )}
            </Card>
          </div>
        </motion.div>

        {/* AI Strategy & Recommendations */}
        {predictData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">AI-Powered Investment Strategy</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Strategy Allocation */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Asset Allocation</h4>
                <div className="space-y-3">
                  {Object.entries(predictData.ai_strategy).map(([asset, allocation]) => (
                    <div key={asset} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-900 font-medium">{asset}</p>
                      <p className="text-slate-900 font-semibold">{(allocation * 100).toFixed(2)}%</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Final Recommendations */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Recommendations</h4>
                <div className="space-y-3">
                  {predictData.final_recommendation.map((rec, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-900 font-medium">{rec.Asset}</p>
                        <p className="text-slate-900 font-semibold text-sm">{(rec.Allocation * 100).toFixed(2)}%</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.Tickers.map((ticker) => (
                          <span key={ticker} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {ticker}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* User Profile Summary */}
            <Card className="bg-white border-slate-200 shadow-sm mt-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Your Profile</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-xs font-medium">Age</p>
                  <p className="text-slate-900 font-semibold text-lg">{predictData.user_profile.Age}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-xs font-medium">Risk Score</p>
                  <p className="text-slate-900 font-semibold text-lg">{predictData.user_profile.RiskScore}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-xs font-medium">Investment Horizon</p>
                  <p className="text-slate-900 font-semibold text-lg">{predictData.user_profile.InvestmentHorizon}yr</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-xs font-medium">Dependents</p>
                  <p className="text-slate-900 font-semibold text-lg">{predictData.user_profile.Dependents}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-slate-600 text-xs font-medium">Annual Income</p>
                  <p className="text-slate-900 font-semibold text-sm">₹{(predictData.user_profile.AnnualIncome / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

      </div>

      {showSearch && (
        <StockSearchDialog
          authToken={authToken}
          onClose={() => setShowSearch(false)}
        />
      )}

    </div>
  )
}
