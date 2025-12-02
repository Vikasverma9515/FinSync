'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp, TrendingDown, DollarSign, Search, BarChart3, PieChart, LineChart, Activity, Target, X
} from 'lucide-react'
import { FaWallet, FaChartPie, FaRobot, FaPiggyBank, FaChartLine, FaCoins } from 'react-icons/fa'
import { BiLineChart, BiStats } from 'react-icons/bi'
import { RiStockFill, RiFundsBoxFill } from 'react-icons/ri'
import { LineChart as RechartsLineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'
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
  const [trackedStocks, setTrackedStocks] = useState<StockQuote[]>([])
  const [customStocks, setCustomStocks] = useState<StockQuote[]>([])
  const [profitLoss, setProfitLoss] = useState<any>(null)
  const [authToken, setAuthToken] = useState<string>('')
  const [predictData, setPredictData] = useState<PredictResponse | null>(null)
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [predictRetryCount, setPredictRetryCount] = useState(0)

  // Track if initial data load is complete to prevent reloading on tab switch
  const hasLoadedData = useRef(false)

  useEffect(() => {
    // Initialize watchlist from localStorage or default
    const saved = localStorage.getItem('finsync_watchlist')
    if (saved) {
      setWatchlist(JSON.parse(saved))
    } else {
      setWatchlist([])
      localStorage.setItem('finsync_watchlist', JSON.stringify([]))
    }
  }, [])

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      const updated = [...watchlist, symbol]
      setWatchlist(updated)
      localStorage.setItem('finsync_watchlist', JSON.stringify(updated))
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(s => s !== symbol)
    setWatchlist(updated)
    localStorage.setItem('finsync_watchlist', JSON.stringify(updated))
  }

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
          const symbols = popularStocks.join(',')
          const response = await fetch(`/api/stocks/batch?symbols=${symbols}`)
          if (response.ok) {
            const data = await response.json()
            setMarketStocks(data)
          }
        } catch (error) {
          console.error('Failed to load market data:', error)
        }
      }

      // Load custom stocks (will be called again when authToken updates)
      const loadCustomStocks = async (token: string) => {
        try {
          const portfolioSymbols = holdingsData?.map((h: any) => h.symbol) || ['RELIANCE', 'TCS', 'INFY']
          const uniqueSymbols = Array.from(new Set(portfolioSymbols)) as string[]

          if (uniqueSymbols.length === 0) return

          const response = await fetch(`/api/stocks/batch?symbols=${uniqueSymbols.join(',')}`)
          if (response.ok) {
            const data = await response.json()
            setCustomStocks(data)
          }
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
          // Always load popular stocks for Market Trends
          const symbols = getPopularStocks().slice(0, 8).join(',')

          const headers: Record<string, string> = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const response = await fetch(`/api/stocks/batch?symbols=${symbols}`, { headers })
          if (response.ok) {
            const data = await response.json()
            console.log('Market stocks loaded:', data)
            setMarketStocks(data)
          }
        } catch (error) {
          console.error('Failed to load market data:', error)
        }
      }



      const loadCustomStocks = async (token: string) => {
        try {
          console.log('Loading custom stocks...')
          const portfolioSymbols = holdings?.map((h: any) => h.symbol) || ['RELIANCE', 'TCS', 'INFY']
          const uniqueSymbols = Array.from(new Set(portfolioSymbols))

          if (uniqueSymbols.length === 0) return

          const headers: Record<string, string> = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const response = await fetch(`/api/stocks/batch?symbols=${uniqueSymbols.join(',')}`, { headers })
          if (response.ok) {
            const data = await response.json()
            console.log('Custom stocks loaded:', data)
            setCustomStocks(data)
          }
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
          }
        } catch (error) {
          console.error('Failed to load profit/loss:', error)
        }
      }

      const loadPredictData = async (token: string) => {
        try {
          console.log(`Loading predict data... (attempt ${predictRetryCount + 1})`)
          if (!profile) return

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
            console.log('Predict data loaded successfully:', data)
            setPredictData(data)
            setPredictRetryCount(0) // Reset retry count on success
          } else {
            console.log('Predict data failed, will retry...')
          }
        } catch (error) {
          console.error('Failed to load predict data:', error)
        }
      }

      setIsLoading(true)
      await Promise.all([
        loadMarketStocks(authToken),
        loadCustomStocks(authToken),
        loadProfitLoss(authToken),
      ])
      setIsLoading(false)

      // Start predict data loading (non-blocking)
      loadPredictData(authToken)

      // Mark that we've loaded data to prevent reload on tab switch
      hasLoadedData.current = true
    }

    // Only load data if we haven't loaded it yet or if critical dependencies changed
    if (!hasLoadedData.current || !authToken) {
      loadAuthenticatedData()
    }
  }, [authToken, holdings, profile])

  // Separate effect for prediction retry logic
  useEffect(() => {
    if (!authToken || !profile || predictData) return

    const maxRetries = 10
    if (predictRetryCount >= maxRetries) {
      console.error('Max retries reached for predict data')
      return
    }

    const delay = Math.min(3000 * Math.pow(1.5, predictRetryCount), 10000)

    const timer = setTimeout(async () => {
      console.log(`Retrying predict data... (attempt ${predictRetryCount + 1}/${maxRetries})`)

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

      const data = await getPredictData(userProfileData, authToken)
      if (data) {
        console.log('Predict data loaded successfully on retry:', data)
        setPredictData(data)
        setPredictRetryCount(0)
      } else {
        setPredictRetryCount(prev => prev + 1)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [authToken, profile, predictData, predictRetryCount])

  // Separate effect for watchlist to avoid full page reload
  useEffect(() => {
    if (!authToken) return

    const loadTrackedStocks = async () => {
      try {
        console.log('Loading tracked stocks...', watchlist)
        if (watchlist.length === 0) {
          setTrackedStocks([])
          return
        }

        const symbols = watchlist.join(',')

        const headers: Record<string, string> = {}
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch(`/api/stocks/batch?symbols=${symbols}`, { headers })
        if (response.ok) {
          const data = await response.json()
          console.log('Tracked stocks loaded:', data)
          setTrackedStocks(data)
        }
      } catch (error) {
        console.error('Failed to load tracked stocks:', error)
      }
    }

    loadTrackedStocks()
  }, [authToken, watchlist])


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

  // Calculate total portfolio value using live prices from customStocks
  const totalPortfolioValue = holdings.reduce((sum, h) => {
    const liveStock = customStocks.find(cs => cs.symbol === h.symbol)
    const livePrice = liveStock ? liveStock.price : h.current_price
    return sum + h.quantity * livePrice
  }, 0)

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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="mb-6 md:mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-xs md:text-sm mb-1">Welcome back,</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Investor'}
                  <span className="animate-pulse">👋</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-lg">
                  Risk Score: <span className="text-teal-400 font-semibold">{profile?.risk_score}</span> • <span className="text-teal-400 font-semibold">{profile?.age}</span> years old
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Portfolio Value</h3>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                ₹{(totalPortfolioValue / 100000).toFixed(2)}L
              </div>
              <div className={`text-sm font-medium flex items-center ${totalGain >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                {totalGain >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {totalGain >= 0 ? '+' : ''}₹{Math.abs(totalGain).toFixed(0)} ({totalGainPercent.toFixed(2)}%)
              </div>
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Total Invested</h3>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-3">
                ₹{(totalCost / 100000).toFixed(2)}L
              </div>
              <div className="text-sm text-slate-400">
                Base investment
              </div>
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium text-sm">Holdings</h3>
                <div className="bg-purple-400/10 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-3">
                {holdings.length}
              </div>
              <div className="text-sm text-slate-400">
                Active stocks
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
            <h3 className="text-white font-semibold mb-6 text-lg flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-teal-400" />
              Portfolio Composition
            </h3>

            {holdings.length > 0 ? (
              <div className="space-y-6">
                {/* Simple 2-Point Growth Chart: Purchase vs Now */}
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={[
                    // Point 1: When stocks were purchased (invested amount)
                    (() => {
                      const dataPoint: any = { period: 'When Bought' }
                      holdings.forEach(stock => {
                        dataPoint[stock.symbol] = stock.quantity * stock.average_price
                      })
                      return dataPoint
                    })(),
                    // Point 2: Current live value (from customStocks live prices)
                    (() => {
                      const dataPoint: any = { period: 'Now' }
                      holdings.forEach(stock => {
                        // Use live price from customStocks if available
                        const liveStock = customStocks.find(cs => cs.symbol === stock.symbol)
                        const livePrice = liveStock ? liveStock.price : stock.current_price
                        dataPoint[stock.symbol] = stock.quantity * livePrice
                      })
                      return dataPoint
                    })()
                  ]}>
                    <defs>
                      {holdings.map((stock, idx) => (
                        <linearGradient key={stock.symbol} id={`color${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.3} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="period"
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.3)"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0a192f',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => `₹${value.toFixed(0)}`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                      iconType="circle"
                    />
                    {holdings.map((stock, idx) => (
                      <Area
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        stackId="1"
                        stroke={COLORS[idx % COLORS.length]}
                        fill={`url(#color${stock.symbol})`}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>

                {/* Stock Value Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {holdings.map((stock, idx) => {
                    const stockValue = stock.quantity * stock.current_price
                    const percentOfPortfolio = (stockValue / totalPortfolioValue) * 100

                    return (
                      <div key={stock.symbol} className="p-3 bg-navy-900/50 rounded-xl border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></div>
                          <span className="text-white font-semibold text-sm">{stock.symbol}</span>
                        </div>
                        <p className="text-lg font-bold text-white">₹{(stockValue / 1000).toFixed(1)}k</p>
                        <p className="text-xs text-slate-400">{percentOfPortfolio.toFixed(1)}% of portfolio</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p>Add stocks to your portfolio to see composition</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-4">
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 mr-2 text-teal-400" />
              Market Trends
            </h3>
            <Button
              onClick={() => setShowSearch(true)}
              className="bg-teal-500 hover:bg-teal-600 text-navy-900 border-0 rounded-xl font-medium text-sm md:text-base px-3 md:px-4"
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
                <div>
                  <p className="text-2xl font-bold text-white">₹{stock.price.toFixed(0)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <RiFundsBoxFill className="text-teal-400" />
            Manage Portfolio
          </h3>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
            <PortfolioUpdater
              holdings={holdings}
              onUpdate={reloadPortfolioData}
              authToken={authToken}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Holdings & Performance</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaWallet className="text-teal-400" />
                  Holdings Distribution
                </h4>
                <div className="bg-teal-400/10 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
              </div>

              {/* Holdings Pie Chart */}
              <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={holdings.map(h => ({ name: h.symbol, value: h.quantity * (h.current_price || h.average_price) }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {holdings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0a192f', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => `₹${value.toFixed(0)}`}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <PortfolioManager
                holdings={holdings}
                onStockRemoved={reloadPortfolioData}
                authToken={authToken}
              />
            </div>

            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-teal-400" />
                Live Prices
              </h4>
              {/* Assuming CardContent is a component that wraps the content */}
              <div className={`space-y-3 ${customStocks.length > 5 ? 'max-h-[500px] overflow-y-auto pr-2' : ''}`}>
                {customStocks.map((stock) => {
                  const isPositive = stock.change >= 0
                  const Icon = isPositive ? TrendingUp : TrendingDown

                  // Find the corresponding holding to get purchase price
                  const holding = holdings.find((h: any) => h.symbol === stock.symbol)
                  const purchasePrice = holding?.average_price || stock.price
                  const currentPrice = stock.price
                  const priceGain = currentPrice - purchasePrice
                  const priceGainPercent = ((priceGain / purchasePrice) * 100)
                  const isProfitable = priceGain >= 0

                  return (
                    <div key={stock.symbol} className="p-4 bg-gradient-to-br from-navy-900/80 to-navy-900/40 rounded-xl border border-slate-700/50 hover:border-teal-500/30 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isPositive ? 'bg-teal-500/10' : 'bg-red-500/10'}`}>
                            <Icon className={`w-4 h-4 ${isPositive ? 'text-teal-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{stock.symbol}</p>
                            <p className="text-xs text-slate-400">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white text-lg">₹{currentPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Purchase vs Current Price Comparison */}
                      {holding && (
                        <div className="mb-3 p-3 bg-navy-800/50 rounded-lg border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                              <span className="text-xs text-slate-400">Bought</span>
                              <span className="text-xs font-semibold text-slate-300">₹{purchasePrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isProfitable ? 'bg-teal-400' : 'bg-red-400'}`}></div>
                              <span className="text-xs text-slate-400">Current</span>
                              <span className="text-xs font-semibold text-slate-300">₹{currentPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Mini Bar Chart */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-navy-700/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-500 rounded-full"
                                style={{ width: `${Math.min((purchasePrice / Math.max(purchasePrice, currentPrice)) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex-1 h-2 bg-navy-700/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isProfitable ? 'bg-teal-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min((currentPrice / Math.max(purchasePrice, currentPrice)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Gain/Loss Display */}
                          <div className="text-center">
                            <span className={`text-xs font-bold ${isProfitable ? 'text-teal-400' : 'text-red-400'}`}>
                              {isProfitable ? '▲' : '▼'} {isProfitable ? '+' : ''}₹{priceGain.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}


                    </div>
                  )
                })}
                {customStocks.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    {holdings.length === 0 ? "No stocks in portfolio" : "Loading live prices..."}
                  </div>
                )}
              </div>
            </div>

            {/* My Stock Tracker Section */}
            {/* <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-teal-400" />
                  My Stock Tracker
                </h4>
                <Button
                  onClick={() => setShowSearch(true)}
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-400 hover:bg-teal-500/10"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Track Stock
                </Button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {trackedStocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 bg-navy-900/50 rounded-lg border border-teal-500/10 hover:border-teal-500/30 transition-colors group">
                    <div>
                      <p className="font-medium text-white">{stock.symbol}</p>
                      <p className="text-sm text-gray-400">{stock.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium text-white">₹{stock.price.toFixed(2)}</p>
                        <p className={`text-sm ${stock.change >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(stock.symbol)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from tracker"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {trackedStocks.length === 0 && (
                  <div className="text-center py-8 bg-navy-900/30 rounded-xl border border-dashed border-slate-700">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Not tracking any stocks yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Track Stock" to add to your list.</p>
                  </div>
                )}
              </div>
            </div> */}

            <div className="lg:col-span-2 bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <BiStats className="w-6 h-6 text-teal-400" />
                Profit/Loss Analysis
              </h4>

              {profitLoss ? (
                <div className="space-y-6">
                  {/* P/L Bar Chart */}
                  {(profitLoss.data && Array.isArray(profitLoss.data) && profitLoss.data.length > 0) || (profitLoss.rawData?.data && Array.isArray(profitLoss.rawData.data) && profitLoss.rawData.data.length > 0) ? (
                    <>
                      <div className="h-64 w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitLoss.data || profitLoss.rawData?.data || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="symbol" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                            <Tooltip
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              contentStyle={{ background: '#0a192f', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value: number) => [`₹${value.toFixed(0)}`, 'Profit/Loss']}
                            />
                            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                              {(profitLoss.data || profitLoss.rawData?.data || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#14b8a6' : '#f43f5e'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {(profitLoss.data?.length > 0 ? profitLoss.data : profitLoss.rawData?.data || [])?.map((stock: any) => {
                          const totalInvested = holdings.find(h => h.symbol === stock.symbol)
                            ? holdings.find(h => h.symbol === stock.symbol)!.quantity * holdings.find(h => h.symbol === stock.symbol)!.average_price
                            : 0
                          const profitPercent = totalInvested > 0 ? (stock.profit / totalInvested) * 100 : 0
                          return (
                            <div key={stock.symbol} className="p-3 bg-navy-900/50 rounded-lg border border-slate-700/50 flex items-center justify-between hover:border-teal-500/30 transition-colors">
                              <div>
                                <p className="text-white font-medium flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${stock.profit >= 0 ? 'bg-teal-400' : 'bg-rose-400'}`}></span>
                                  {stock.symbol}
                                </p>
                                <p className={`text-xs mt-1 ${profitPercent >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                  {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                                </p>
                              </div>
                              <p className={`text-sm font-bold ${stock.profit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                                {stock.profit >= 0 ? '+' : ''}₹{Math.abs(stock.profit).toFixed(0)}
                              </p>
                            </div>
                          )
                        })}
                      </div>

                      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-teal-600/5 rounded-xl border border-teal-400/20 mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm font-medium">Total Net Profit/Loss</p>
                          <p className="text-xs text-slate-500 mt-1">Realized + Unrealized</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl md:text-3xl font-bold ${profitLoss.totalProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                            {profitLoss.totalProfit >= 0 ? '+' : ''}₹{Math.abs(profitLoss.totalProfit).toFixed(0)}
                          </p>
                          <p className={`text-sm font-semibold ${profitLoss.percentage >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                            {profitLoss.percentage >= 0 ? '+' : ''}{profitLoss.percentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm p-8 bg-navy-900/30 rounded-xl border border-dashed border-slate-700 text-center">
                      <FaChartLine className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p>No profit/loss data available yet.</p>
                      <p className="text-xs text-slate-500 mt-1">Add stocks to your portfolio to see analysis.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Loading analysis...
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-purple-400" />
            Investment Planning
          </h3>
          <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
            <ProjectionCalculator holdings={holdings} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-teal-400" />
            AI-Powered Strategy
          </h3>

          {predictData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation Card */}
              <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaChartPie className="text-teal-400" />
                  Asset Allocation
                </h4>

                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Pie Chart */}
                  <div className="w-full md:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={Object.entries(predictData.ai_strategy).map(([name, value]) => ({ name, value: (value as number) * 100 }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.entries(predictData.ai_strategy).map((entry, index) => {
                            const colors = ['#14b8a6', '#10b981', '#8b5cf6', '#f97316'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(0,0,0,0.1)" />;
                          })}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#0a192f', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend / Progress Bars */}
                  <div className="w-full md:w-1/2 space-y-5">
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
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-300 font-medium text-sm flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${color.text.replace('text-', 'bg-')}`}></span>
                              {asset}
                            </p>
                            <span className={`${color.text} font-bold text-sm`}>
                              {(allocation as number * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-navy-700/50 rounded-full overflow-hidden">
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
              </div>

              {/* Recommendations Card */}
              <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaRobot className="text-teal-400" />
                  Recommendations
                </h4>
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
          ) : (
            <div className="bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-white text-lg font-semibold mb-2">Loading AI Recommendations</p>
                <p className="text-slate-400 text-sm">Analyzing your portfolio and generating personalized strategy...</p>
              </div>
            </div>
          )}

          {/* Investor Profile Card */}
          {predictData && (
            <div className="mt-6 bg-navy-800/50 border border-slate-700/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-sm">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaPiggyBank className="w-6 h-6 mr-2 text-teal-400" />
                Investor Profile
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="p-4 md:p-5 bg-gradient-to-br from-teal-500/10 to-teal-600/5 rounded-xl border border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Age</p>
                  <p className="text-white font-bold text-2xl md:text-3xl">{predictData.user_profile.Age}</p>
                  <p className="text-teal-400 text-xs mt-1">years</p>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Risk Score</p>
                  <p className="text-white font-bold text-2xl md:text-3xl">{predictData.user_profile.RiskScore}</p>
                  <p className="text-emerald-400 text-xs mt-1">out of 10</p>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Horizon</p>
                  <p className="text-white font-bold text-2xl md:text-3xl">{predictData.user_profile.InvestmentHorizon}</p>
                  <p className="text-purple-400 text-xs mt-1">years</p>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl border border-orange-400/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Dependents</p>
                  <p className="text-white font-bold text-2xl md:text-3xl">{predictData.user_profile.Dependents}</p>
                  <p className="text-orange-400 text-xs mt-1">people</p>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-pink-500/10 to-pink-600/5 rounded-xl border border-pink-400/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                  <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">Income</p>
                  <p className="text-white font-bold text-xl md:text-2xl">₹{(predictData.user_profile.AnnualIncome / 1000000).toFixed(1)}M</p>
                  <p className="text-pink-400 text-xs mt-1">per year</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {showSearch && (
        <StockSearchDialog
          authToken={authToken}
          onClose={() => setShowSearch(false)}
          onStockAdded={reloadPortfolioData}
          onAddToWatchlist={addToWatchlist}
        />
      )}

    </div>
  )
}
