'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  TrendingUp, TrendingDown, DollarSign, Plus, LogOut, RefreshCw, PieChart,
  MessageSquare, Brain, BarChart3, Sparkles, Send
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { StockSearchDialog } from '@/components/StockSearchDialog'
import { BuyStockDialog } from '@/components/BuyStockDialog'
import { SellStockDialog } from '@/components/SellStockDialog'
import InvestmentPlannerSuggestor from '@/components/InvestmentPlannerSuggestor'
import { finSyncAI } from '@/lib/ai'
import { getPopularStocks, getStockQuote } from '@/lib/stocks'
import type { UserProfile, Portfolio } from '@/types'
import type { StockQuote } from '@/lib/stocks'
import Header from '@/components/Header'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [holdings, setHoldings] = useState<(Portfolio & { quote?: StockQuote })[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string; price: number } | null>(null)
  const [sellStock, setSellStock] = useState<Portfolio | null>(null)
  const [showInvestmentPlanner, setShowInvestmentPlanner] = useState(false)

  // Check for showPlans query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('showPlans') === 'true') {
      setShowInvestmentPlanner(true)
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // AI Features
  const [marketStocks, setMarketStocks] = useState<StockQuote[]>([])
  const [aiPredictions, setAiPredictions] = useState<any[]>([])
  const [marketInsights, setMarketInsights] = useState<string[]>([])
  const [insightsIndex, setInsightsIndex] = useState(0)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([])
  const [chatInput, setChatInput] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

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

      // Load market stocks
      try {
        const popularStocks = getPopularStocks()
        const marketData = await Promise.all(
          popularStocks.slice(0, 8).map(async (symbol) => {
            try {
              return await getStockQuote(symbol)
            } catch {
              return null
            }
          })
        )
        setMarketStocks(marketData.filter(Boolean) as StockQuote[])
      } catch (error) {
        console.error('Failed to load market data:', error)
      }

      // Load AI insights
      try {
        const response = await fetch('/api/ai/insights')
        if (response.ok) {
          const data = await response.json()
          const insightsArray = data.insights.split('\n').filter((line: string) => line.trim())
          setMarketInsights(insightsArray)
        }
      } catch (error) {
        console.error('Failed to load AI insights:', error)
      }

      setIsLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleBuyStock = (symbol: string, name: string) => {
    setSelectedStock({ symbol, name, price: 0 })
    fetchStockPrice(symbol).then(price => {
      setSelectedStock({ symbol, name, price })
    })
  }

  const fetchStockPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await fetch(`/api/stocks/quote?symbol=${symbol}`)
      const data = await response.json()
      return data.price || 0
    } catch {
      return 0
    }
  }

  const refreshPrices = async () => {
    setRefreshing(true)
    try {
      const updated = await Promise.all(
        holdings.map(async (holding) => {
          const price = await fetchStockPrice(holding.symbol)
          return { ...holding, currentPrice: price }
        })
      )
      setHoldings(updated)
    } catch (error) {
      console.error('Error refreshing prices:', error)
    } finally {
      setRefreshing(false)
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

  // AI Functions
  const generatePredictions = async () => {
    if (!profile || holdings.length === 0) return

    try {
      const predictions = await Promise.all(
        holdings.slice(0, 3).map(async (holding) => {
          try {
            const response = await fetch('/api/ai/predict', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                symbol: holding.symbol,
                currentPrice: holding.current_price || holding.average_price,
                timeframe: '3M'
              }),
            })

            if (!response.ok) return null

            const data = await response.json()
            return data.prediction
          } catch {
            return null
          }
        })
      )
      setAiPredictions(predictions.filter(Boolean))
    } catch (error) {
      console.error('Failed to generate predictions:', error)
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsAIThinking(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }])
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  const nextInsights = () => {
    if (insightsIndex + 5 < marketInsights.length) {
      setInsightsIndex(insightsIndex + 5)
    }
  }

  const prevInsights = () => {
    if (insightsIndex - 5 >= 0) {
      setInsightsIndex(insightsIndex - 5)
    }
  }

  const currentInsights = marketInsights.slice(insightsIndex, insightsIndex + 5)

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
                {profile?.risk_tolerance} risk • {profile?.age} years old
              </p>
            </div>
            <Button onClick={refreshPrices} disabled={refreshing} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Holdings</h3>
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {holdings.length}
              </div>
              <div className="text-sm text-slate-600">
                Different stocks
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Market Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-slate-900" />
              Market Overview
            </h3>
            <Button
              onClick={generatePredictions}
              variant="outline"
              size="sm"
              disabled={holdings.length === 0}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Predictions
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Stocks */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Popular Stocks</h4>
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
                    <Button
                      size="sm"
                      onClick={() => handleBuyStock(stock.symbol, stock.name)}
                      className="ml-2 bg-slate-900 hover:bg-slate-800"
                    >
                      Buy
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI Market Insights
              </h4>
              <div className="space-y-2">
                {currentInsights.length > 0 ? (
                  currentInsights.map((insight, index) => (
                    <div key={insightsIndex + index} className="text-slate-700 text-sm p-3 bg-slate-50 rounded-lg border border-slate-200">
                      {insight}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-600 text-sm">Loading market insights...</div>
                )}
              </div>
              {marketInsights.length > 5 && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={prevInsights}
                    disabled={insightsIndex === 0}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Previous
                  </Button>
                  <span className="text-slate-600 text-xs">
                    {insightsIndex + 1}-{Math.min(insightsIndex + 5, marketInsights.length)} of {marketInsights.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={nextInsights}
                    disabled={insightsIndex + 5 >= marketInsights.length}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* AI Predictions */}
          {aiPredictions.length > 0 && (
            <Card className="mt-6 bg-white border-slate-200 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                AI Price Predictions (3 Months)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiPredictions.map((prediction, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h5 className="text-slate-900 font-medium mb-2">{prediction.symbol}</h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">Current: ₹{prediction.currentPrice.toFixed(2)}</p>
                      <p className="text-slate-600">Predicted: ₹{prediction.predictedPrice.toFixed(2)}</p>
                      <p className={`font-medium ${prediction.predictedPrice > prediction.currentPrice ? 'text-emerald-600' : 'text-red-600'}`}>
                        {prediction.predictedPrice > prediction.currentPrice ? '↗' : '↘'} {((prediction.predictedPrice - prediction.currentPrice) / prediction.currentPrice * 100).toFixed(1)}%
                      </p>
                      <p className="text-slate-500">Confidence: {prediction.confidence}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>

        {/* AI Chat Assistant */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="relative bg-white border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-slate-900" />
                AI Financial Assistant
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIChat(!showAIChat)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {showAIChat ? 'Hide' : 'Show'} Chat
              </Button>
            </div>

            {showAIChat && (
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-slate-600 py-8">
                      <Brain className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p>Hey! I'm Alex, your financial buddy. What's on your mind today?</p>
                      <p className="text-sm mt-2">Ask about investments, your portfolio, or market trends!</p>
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isAIThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white text-slate-900 px-4 py-2 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about investments, portfolio analysis, or market trends..."
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:border-slate-900 focus:outline-none"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isAIThinking}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Your Holdings</h3>
            <div className="flex gap-3">
              <Button onClick={() => setShowInvestmentPlanner(true)} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <PieChart className="w-4 h-4 mr-2" />
                Investment Plan
              </Button>
              <Button onClick={() => setShowSearch(true)} className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                Buy Stock
              </Button>
            </div>
          </div>

          {holdings.length === 0 ? (
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No holdings yet</p>
                <Button onClick={() => setShowSearch(true)} className="bg-slate-900 hover:bg-slate-800">
                  Buy Your First Stock
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding) => {
                const holdingValue = holding.quantity * holding.current_price
                const holdingCost = holding.quantity * holding.average_price
                const holdingGain = holdingValue - holdingCost
                const holdingGainPercent = (holdingGain / holdingCost) * 100

                return (
                  <motion.div
                    key={holding.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-slate-900 mb-1">
                            {holding.symbol}
                          </h4>
                          <p className="text-sm text-slate-600 mb-2">
                            {holding.quantity} shares @ ₹{holding.average_price.toFixed(2)}
                          </p>
                          <div className="text-sm text-slate-600">
                            Current Price: ₹{holding.current_price.toFixed(2)}
                          </div>
                        </div>

                        <div className="text-right mr-6">
                          <div className="text-2xl font-bold text-slate-900 mb-1">
                            ₹{holdingValue.toFixed(2)}
                          </div>
                          <div className={`text-sm mb-3 font-medium ${
                            holdingGain >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {holdingGain >= 0 ? '+' : ''}₹{holdingGain.toFixed(2)} ({holdingGainPercent.toFixed(2)}%)
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSellStock(holding)}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              Sell
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleBuyStock(holding.symbol, holding.name)}
                              className="bg-slate-900 hover:bg-slate-800"
                            >
                              Buy More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      {showSearch && (
        <StockSearchDialog
          onSelect={(symbol, name) => {
            setShowSearch(false)
            handleBuyStock(symbol, name)
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {selectedStock && (
        <BuyStockDialog
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          currentPrice={selectedStock.price}
          onClose={() => setSelectedStock(null)}
          onSuccess={() => {
            setSelectedStock(null)
            location.reload()
          }}
        />
      )}

      {sellStock && (
        <SellStockDialog
          symbol={sellStock.symbol}
          name={sellStock.name}
          currentPrice={sellStock.current_price}
          quantity={sellStock.quantity}
          averagePrice={sellStock.average_price}
          onClose={() => setSellStock(null)}
          onSuccess={() => {
            setSellStock(null)
            location.reload()
          }}
        />
      )}

      {showInvestmentPlanner && (
        <InvestmentPlannerSuggestor
          onBack={() => setShowInvestmentPlanner(false)}
        />
      )}
    </div>
  )
}
