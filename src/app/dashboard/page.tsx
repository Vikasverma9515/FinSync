'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp, TrendingDown, DollarSign, Search, BarChart3, PieChart, LineChart, Activity, Target
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { StockSearchDialog } from '@/components/StockSearchDialog'
import { PortfolioManager } from '@/components/PortfolioManager'
import { PortfolioUpdater } from '@/components/PortfolioUpdater'
import { ProjectionCalculator } from '@/components/ProjectionCalculator'
import { getPopularStocks, getStockQuote, getPredictData } from '@/lib/stocks'
import type { UserProfile, Portfolio } from '@/types'
import type { StockQuote, PredictResponse } from '@/lib/stocks'
import Header from '@/components/Header'
import { DashboardLoader } from '@/components/DashboardLoader'

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

  const reloadPortfolioData = async () => {
    console.log('Reloading portfolio and profit/loss data...')
    const supabase = createClient()

    const { data: holdingsData } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user?.id)

    setHoldings(holdingsData || [])

    if (authToken) {
      try {
        const response = await fetch('/api/profit-loss', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Updated profit/loss data:', data)
          setProfitLoss(data)
        }
      } catch (error) {
        console.error('Failed to reload profit/loss:', error)
      }
    }
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
    return <DashboardLoader />
  }

  const generateChartData = () => {
    const data = []
    let value = totalCost
    for (let i = 0; i < 30; i++) {
      const variance = (Math.random() - 0.48) * totalCost * 0.02
      value = Math.max(totalCost * 0.8, value + variance)
      data.push({
        day: i,
        value: Math.round(value)
      })
    }
    return data
  }

  const chartData = generateChartData()

  const allocationData = holdings.map(h => ({
    name: h.symbol,
    value: h.quantity * (h.current_price || 0)
  })).filter(d => d.value > 0)

  const COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Investor'}
                </h2>
                <p className="text-slate-400 text-lg">
                  Risk Score: <span className="text-teal-400 font-semibold">{profile?.risk_score}</span> • <span className="text-teal-400 font-semibold">{profile?.age}</span> years old
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Portfolio Value</h3>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                ₹{(totalPortfolioValue / 100000).toFixed(2)}L
              </div>
              <div className={`text-sm font-medium flex items-center ${totalGain >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {totalGain >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {totalGain >= 0 ? '+' : ''}₹{Math.abs(totalGain).toFixed(0)} ({totalGainPercent.toFixed(2)}%)
              </div>
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Total Invested</h3>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                ₹{(totalCost / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-slate-400">
                Base investment
              </div>
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Holdings</h3>
                <div className="bg-purple-400/10 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {holdings.length}
              </div>
              <div className="text-sm text-slate-400">
                Active stocks
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <h3 className="text-white font-semibold mb-6 text-lg flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-teal-400" />
              Portfolio Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64ffda" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#64ffda" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.3)" />
                <Tooltip contentStyle={{ background: '#0a192f', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="#64ffda" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-teal-400" />
              Market Trends
            </h3>
            <Button
              onClick={() => setShowSearch(true)}
              className="bg-teal-500 hover:bg-teal-600 text-navy-900 border-0 rounded-xl font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketStocks.slice(0, 6).map((stock, idx) => (
              <motion.div
                key={stock.symbol}
                variants={itemVariants}
                className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-4 shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">{stock.symbol}</p>
                    <p className="text-slate-400 text-sm">{stock.name}</p>
                  </div>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-teal-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-2xl font-bold text-white">₹{stock.price.toFixed(0)}</p>
                  <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <h3 className="text-2xl font-bold text-white mb-6">Manage Portfolio</h3>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <PortfolioUpdater
              holdings={holdings}
              onUpdate={reloadPortfolioData}
              authToken={authToken}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <h3 className="text-2xl font-bold text-white mb-6">Holdings & Performance</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Holdings</h4>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <PortfolioManager
                holdings={holdings}
                onStockRemoved={reloadPortfolioData}
                authToken={authToken}
              />
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-teal-400" />
                Live Prices
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {customStocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-navy-800/50 rounded-lg border border-slate-700/50 hover:bg-navy-800 transition">
                    <div>
                      <p className="text-white font-medium">{stock.symbol}</p>
                      <p className="text-slate-400 text-sm">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">₹{stock.price.toFixed(0)}</p>
                      <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-teal-400" />
                Profit/Loss Summary
              </h4>
              {profitLoss ? (
                <div className="space-y-4">
                  {(profitLoss.data && Array.isArray(profitLoss.data) && profitLoss.data.length > 0) || (profitLoss.rawData?.data && Array.isArray(profitLoss.rawData.data) && profitLoss.rawData.data.length > 0) ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                        {(profitLoss.data?.length > 0 ? profitLoss.data : profitLoss.rawData?.data || [])?.map((stock: any) => {
                          const totalInvested = holdings.find(h => h.symbol === stock.symbol)
                            ? holdings.find(h => h.symbol === stock.symbol)!.quantity * holdings.find(h => h.symbol === stock.symbol)!.average_price
                            : 0
                          const profitPercent = totalInvested > 0 ? (stock.profit / totalInvested) * 100 : 0
                          return (
                            <div key={stock.symbol} className="p-3 bg-navy-800/50 rounded-lg border border-slate-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-white font-medium">{stock.symbol}</p>
                                <p className={`text-sm font-bold ${stock.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                  {stock.profit >= 0 ? '+' : ''}₹{Math.abs(stock.profit).toFixed(0)}
                                </p>
                              </div>
                              <p className={`text-xs ${profitPercent >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      <div className="p-4 bg-teal-400/10 rounded-lg border border-teal-400/20 mt-4">
                        <p className="text-slate-400 text-sm font-medium">Total Profit/Loss</p>
                        <div className="flex items-baseline justify-between mt-2">
                          <p className={`text-3xl font-bold ${profitLoss.totalProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                            {profitLoss.totalProfit >= 0 ? '+' : ''}₹{Math.abs(profitLoss.totalProfit).toFixed(0)}
                          </p>
                          <p className={`text-lg font-semibold ${profitLoss.percentage >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                            {profitLoss.percentage >= 0 ? '+' : ''}{profitLoss.percentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm p-4 bg-slate-50 rounded-lg">
                      No profit/loss data available
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">Loading profit/loss data...</div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-purple-400" />
            Investment Planning
          </h3>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <ProjectionCalculator holdings={holdings} />
          </div>
        </motion.div>

        {predictData && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-teal-400" />
              AI-Powered Strategy
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation Card */}
              <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-white mb-6">Asset Allocation</h4>
                <div className="space-y-5">
                  {Object.entries(predictData.ai_strategy).map(([asset, allocation], index) => {
                    const colors = [
                      { bg: 'from-teal-500 to-teal-400', text: 'text-teal-400', light: 'bg-teal-500/10' },
                      { bg: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', light: 'bg-emerald-500/10' },
                      { bg: 'from-purple-500 to-purple-400', text: 'text-purple-400', light: 'bg-purple-500/10' },
                      { bg: 'from-orange-500 to-orange-400', text: 'text-orange-400', light: 'bg-orange-500/10' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={asset} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-white font-semibold text-base">{asset}</p>
                          <span className={`${color.text} font-bold text-lg`}>
                            {(allocation as number * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-3 bg-navy-700/50 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${color.bg} rounded-full transition-all duration-500 group-hover:shadow-lg`}
                            style={{ width: `${(allocation as number * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations Card */}
              <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-white mb-6">Recommendations</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {predictData.final_recommendation.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-navy-800/80 to-navy-800/40 rounded-xl border border-slate-700/50 hover:border-teal-500/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-bold text-base">{rec.Asset}</p>
                        <span className="text-teal-400 font-bold text-lg bg-teal-400/10 px-3 py-1 rounded-full border border-teal-400/30">
                          {(rec.Allocation * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.Tickers.map((ticker) => (
                          <span
                            key={ticker}
                            className="text-xs font-medium bg-teal-400/10 text-teal-400 px-3 py-1.5 rounded-full border border-teal-400/30 hover:bg-teal-400/20 transition-colors cursor-default"
                          >
                            {ticker}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Investor Profile Card */}
            <div className="mt-6 bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-teal-400" />
                Investor Profile
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-gradient-to-br from-teal-500/10 to-teal-600/5 rounded-xl border border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Age</p>
                  <p className="text-white font-bold text-3xl">{predictData.user_profile.Age}</p>
                  <p className="text-teal-400 text-xs mt-1">years</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Risk Score</p>
                  <p className="text-white font-bold text-3xl">{predictData.user_profile.RiskScore}</p>
                  <p className="text-emerald-400 text-xs mt-1">out of 10</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Horizon</p>
                  <p className="text-white font-bold text-3xl">{predictData.user_profile.InvestmentHorizon}</p>
                  <p className="text-purple-400 text-xs mt-1">years</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-400/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Dependents</p>
                  <p className="text-white font-bold text-3xl">{predictData.user_profile.Dependents}</p>
                  <p className="text-orange-400 text-xs mt-1">people</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-xl border border-pink-400/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Income</p>
                  <p className="text-white font-bold text-2xl">₹{(predictData.user_profile.AnnualIncome / 1000000).toFixed(1)}M</p>
                  <p className="text-pink-400 text-xs mt-1">per year</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {showSearch && (
        <StockSearchDialog
          authToken={authToken}
          onClose={() => setShowSearch(false)}
          onStockAdded={reloadPortfolioData}
        />
      )}

    </div>
  )
}
