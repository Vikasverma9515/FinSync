'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, TrendingDown,
  Calendar, DollarSign, Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'

interface Transaction {
  id: string
  type: 'buy' | 'sell'
  symbol: string
  name: string
  quantity: number
  price: number
  total: number
  timestamp: string
}

export default function ChangesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (loading) return

      if (!user) {
        router.push('/login')
        return
      }

      const supabase = createClient()

      // Load transaction history (you can implement this based on your database schema)
      // For now, we'll show a placeholder
      setTransactions([
        {
          id: '1',
          type: 'buy',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 10,
          price: 150.00,
          total: 1500.00,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'sell',
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 5,
          price: 2800.00,
          total: 14000.00,
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ])

      setIsLoading(false)
    }

    loadData()
  }, [user, loading, router])

  const refreshData = async () => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
                <Activity className="w-8 h-8 mr-3 text-slate-900" />
                All Changes
              </h2>
              <p className="text-slate-600">
                Track all your investment activities and transactions
              </p>
            </div>
            <Button
              onClick={refreshData}
              disabled={refreshing}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Total Transactions</h3>
                <Activity className="w-5 h-5 text-slate-900" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {transactions.length}
              </div>
              <div className="text-sm text-slate-600">
                All time
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Buys</h3>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {transactions.filter(t => t.type === 'buy').length}
              </div>
              <div className="text-sm text-slate-600">
                Purchase transactions
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Sells</h3>
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-2">
                {transactions.filter(t => t.type === 'sell').length}
              </div>
              <div className="text-sm text-slate-600">
                Sale transactions
              </div>
            </Card>
          </div>

          <Card className="bg-white border-slate-200 shadow-sm">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Transaction History</h3>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-slate-900 mb-2">No transactions yet</h4>
                  <p className="text-slate-600">Your investment activities will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'buy' ? 'bg-emerald-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'buy' ? (
                            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">{transaction.name}</p>
                          <p className="text-slate-600 text-sm">{transaction.symbol}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            transaction.type === 'buy'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-900 font-semibold">₹{transaction.total.toFixed(2)}</p>
                        <p className="text-slate-600 text-sm">
                          {transaction.quantity} shares @ ₹{transaction.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right text-slate-600 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}