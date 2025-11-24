'use client'

import React, { useState } from 'react'
import { ArrowLeft, Receipt, Loader2, TrendingDown, CheckCircle, DollarSign, Home, Users, Briefcase, MapPin, Calendar, PieChart, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import TaxBreakdownChart from './charts/TaxBreakdownChart'
import DeductionTrackerChart from './charts/DeductionTrackerChart'
import AnimatedCounter from './AnimatedCounter'
import TaxSavingTipsCard from './TaxSavingTipsCard'
import TaxDeductionsGuide from './TaxDeductionsGuide'
import type { TaxSaverQuestionnaireData, TaxSaverPlanOutput } from '@/types'

interface TaxSaverPlannerProps {
    onBack: () => void
}

const TaxSaverPlanner: React.FC<TaxSaverPlannerProps> = ({ onBack }) => {
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<Partial<TaxSaverQuestionnaireData>>({
        employmentType: 'salaried',
        city: 'metro',
        investmentPreference: 'balanced',
        hasParents: false,
        age: 30,
    })
    const [generatedPlan, setGeneratedPlan] = useState<TaxSaverPlanOutput | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showResults, setShowResults] = useState(false)

    const totalSteps = 4

    const stepTitles = {
        1: 'Income Details',
        2: 'Current Investments',
        3: 'Personal Information',
        4: 'Preferences',
    }

    const stepDescriptions = {
        1: 'Tell us about your income to calculate your tax liability',
        2: 'Let us know what you\'ve already invested this year',
        3: 'Help us personalize your tax-saving strategy',
        4: 'Final details to optimize your tax plan',
    }

    const handleInputChange = (field: keyof TaxSaverQuestionnaireData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        } else {
            generatePlan()
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const getCompletionPercentage = () => {
        return Math.round((currentStep / totalSteps) * 100)
    }

    const generatePlan = async () => {
        setIsLoading(true)
        setError(null)
        setShowResults(true)

        try {
            const response = await fetch('/api/ai/tax-saver-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to generate tax plan')
            }

            const plan = await response.json()
            setGeneratedPlan(plan)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setShowResults(false)
        } finally {
            setIsLoading(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 flex-shrink-0" />
                                <span>Annual Income (₹)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.annualIncome || ''}
                                onChange={(e) => handleInputChange('annualIncome', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                style={{
                                    backgroundColor: '#1F2A37',
                                    borderColor: '#334155',
                                    color: '#E2E8F0',
                                }}
                                placeholder="e.g., 1200000"
                            />
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>Your total annual salary or business income</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                                <span>Employment Type</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                                {['salaried', 'business', 'freelancer'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleInputChange('employmentType', type)}
                                        className="px-3 py-3 sm:py-3.5 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium min-h-[44px]"
                                        style={{
                                            borderColor: formData.employmentType === type ? '#0D9488' : '#334155',
                                            backgroundColor: formData.employmentType === type ? 'rgba(13, 148, 136, 0.1)' : '#1F2A37',
                                            color: formData.employmentType === type ? '#5EEAD4' : '#94A3B8',
                                        }}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                                <span>80C Investments Already Made (₹)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.investments80C || ''}
                                onChange={(e) => handleInputChange('investments80C', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                style={{
                                    backgroundColor: '#1F2A37',
                                    borderColor: '#334155',
                                    color: '#E2E8F0',
                                }}
                                placeholder="e.g., 50000"
                            />
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>PPF, ELSS, LIC, NSC, etc. (Max limit: ₹1,50,000)</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                                <span>80D Health Insurance Premium (₹)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.healthInsurance80D || ''}
                                onChange={(e) => handleInputChange('healthInsurance80D', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                style={{
                                    backgroundColor: '#1F2A37',
                                    borderColor: '#334155',
                                    color: '#E2E8F0',
                                }}
                                placeholder="e.g., 15000"
                            />
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>Health insurance for self and family</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 flex-shrink-0" />
                                <span>Home Loan Interest (Annual) (₹)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.homeLoanInterest || ''}
                                onChange={(e) => handleInputChange('homeLoanInterest', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                style={{
                                    backgroundColor: '#1F2A37',
                                    borderColor: '#334155',
                                    color: '#E2E8F0',
                                }}
                                placeholder="e.g., 100000"
                            />
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>Interest paid on home loan (Max: ₹2,00,000)</p>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 flex-shrink-0" />
                                <span>Monthly Rent Paid (₹)</span>
                            </label>
                            <input
                                type="number"
                                value={formData.rentPaid || ''}
                                onChange={(e) => handleInputChange('rentPaid', parseFloat(e.target.value))}
                                className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                style={{
                                    backgroundColor: '#1F2A37',
                                    borderColor: '#334155',
                                    color: '#E2E8F0',
                                }}
                                placeholder="e.g., 20000"
                            />
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>For HRA exemption calculation</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                                    <span>Your Age</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.age || ''}
                                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                    style={{
                                        backgroundColor: '#1F2A37',
                                        borderColor: '#334155',
                                        color: '#E2E8F0',
                                    }}
                                    placeholder="e.g., 30"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                                    <span>City Type</span>
                                </label>
                                <select
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full px-4 py-3 sm:py-3.5 rounded-lg border transition-all text-sm sm:text-base"
                                    style={{
                                        backgroundColor: '#1F2A37',
                                        borderColor: '#334155',
                                        color: '#E2E8F0',
                                    }}
                                >
                                    <option value="metro">Metro</option>
                                    <option value="non-metro">Non-Metro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-5 sm:space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
                                <span>Do you have parents?</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                {[
                                    { value: true, label: 'Yes' },
                                    { value: false, label: 'No' }
                                ].map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => handleInputChange('hasParents', option.value)}
                                        className="px-4 py-3 sm:py-3.5 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium min-h-[44px]"
                                        style={{
                                            borderColor: formData.hasParents === option.value ? '#0D9488' : '#334155',
                                            backgroundColor: formData.hasParents === option.value ? 'rgba(13, 148, 136, 0.1)' : '#1F2A37',
                                            color: formData.hasParents === option.value ? '#5EEAD4' : '#94A3B8',
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs sm:text-sm mt-2" style={{ color: '#94A3B8' }}>Additional 80D deduction available for parents' health insurance</p>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium mb-2.5" style={{ color: '#E2E8F0' }}>
                                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                                <span>Investment Preference</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                                {[
                                    { value: 'safe', label: 'Safe', desc: 'FD, PPF' },
                                    { value: 'balanced', label: 'Balanced', desc: 'Mix' },
                                    { value: 'growth', label: 'Growth', desc: 'ELSS' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleInputChange('investmentPreference', option.value)}
                                        className="px-3 py-3 sm:py-3.5 rounded-lg border-2 transition-all min-h-[70px] sm:min-h-[88px] flex flex-col items-center justify-center"
                                        style={{
                                            borderColor: formData.investmentPreference === option.value ? '#0D9488' : '#334155',
                                            backgroundColor: formData.investmentPreference === option.value ? 'rgba(13, 148, 136, 0.1)' : '#1F2A37',
                                            color: formData.investmentPreference === option.value ? '#5EEAD4' : '#94A3B8',
                                        }}
                                    >
                                        <div className="font-semibold text-xs sm:text-sm">{option.label}</div>
                                        <div className="text-[10px] sm:text-xs opacity-70 mt-0.5">{option.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center">
                    <motion.div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-6 sm:mb-8 flex items-center justify-center"
                        style={{ backgroundColor: '#1F2A37' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Receipt className="w-8 h-8 sm:w-10 sm:h-10 text-teal-400" />
                    </motion.div>

                    <motion.div
                        className="text-center max-w-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h2 className="text-xl sm:text-2xl md:text-3xl mb-3 sm:mb-4" style={{ color: '#E2E8F0', fontWeight: '400', letterSpacing: '-0.01em' }}>
                            Creating Your Tax Plan
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg" style={{ color: '#94A3B8' }}>
                            Our AI is analyzing your tax situation and finding the best savings opportunities...
                        </p>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (showResults && generatedPlan) {
        return (
            <div className="min-h-screen" >
                <div className="px-2 py-4 md:px-6 md:py-6">
                    <div className="w-full">
                        {/* Header */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <motion.button
                                onClick={() => {
                                    setShowResults(false)
                                    setError(null)
                                }}
                                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors flex-shrink-0 mt-0.5"
                                whileHover={{ x: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ArrowLeft className="w-5 h-5" style={{ color: '#E2E8F0' }} />
                            </motion.button>

                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: '#1F2A37' }}
                                >
                                    <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight" style={{ color: '#E2E8F0', letterSpacing: '-0.02em' }}>
                                        Your Tax Optimization Plan
                                    </h1>
                                    <p className="text-xs sm:text-sm mt-1" style={{ color: '#94A3B8' }}>
                                        AI-powered tax savings strategy
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Results Content */}
                        <div className="space-y-4 sm:space-y-6 pb-8">
                            {/* Summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-2 sm:mb-4"
                            >
                                <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">{generatedPlan.summary}</p>
                            </motion.div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/30 h-full p-0">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center justify-between mb-3 gap-2">
                                                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                                                <div className="text-xs font-medium text-red-400 bg-red-500/20 px-2 py-0.5 rounded whitespace-nowrap">Current</div>
                                            </div>
                                            <p className="text-slate-400 text-xs sm:text-sm mb-2">Tax Liability</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-red-400">
                                                <AnimatedCounter value={generatedPlan.currentTax} prefix="₹" duration={2} />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 h-full p-0">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center justify-between mb-3 gap-2">
                                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
                                                <div className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-0.5 rounded whitespace-nowrap">Optimized</div>
                                            </div>
                                            <p className="text-slate-400 text-xs sm:text-sm mb-2">After Optimization</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-green-400">
                                                <AnimatedCounter value={generatedPlan.optimizedTax} prefix="₹" duration={2} />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/30 h-full p-0">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center justify-between mb-3 gap-2">
                                                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 flex-shrink-0" />
                                                <div className="text-xs font-medium text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded whitespace-nowrap">Savings</div>
                                            </div>
                                            <p className="text-slate-400 text-xs sm:text-sm mb-2">Total Tax Saved</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-teal-400">
                                                <AnimatedCounter value={generatedPlan.totalSavings} prefix="₹" duration={2.5} />
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Tax Breakdown Chart */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Card className="bg-navy-800/50 border-slate-700/50 p-0">
                                    <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
                                        <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                                            <TrendingDown className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span>Tax Comparison</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm text-slate-400">
                                            See how much you can save with optimization
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3">
                                        <TaxBreakdownChart
                                            currentTax={generatedPlan.currentTax}
                                            optimizedTax={generatedPlan.optimizedTax}
                                            totalSavings={generatedPlan.totalSavings}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Deduction Tracker */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <Card className="bg-navy-800/50 border-slate-700/50 p-0">
                                    <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
                                        <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                                            <span>Deduction Tracker</span>
                                        </CardTitle>
                                        <CardDescription className="text-xs sm:text-sm text-slate-400">
                                            Track your deduction limits and opportunities
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3">
                                        <DeductionTrackerChart deductions={generatedPlan.deductions} />
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Recommendations */}
                            {generatedPlan.recommendations && generatedPlan.recommendations.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                    <Card className="bg-navy-800/50 border-slate-700/50 p-0">
                                        <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
                                            <CardTitle className="text-sm sm:text-base text-white">Personalized Recommendations</CardTitle>
                                            <CardDescription className="text-xs sm:text-sm text-slate-400">
                                                AI-powered suggestions to maximize your tax savings
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                {generatedPlan.recommendations.map((rec, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-teal-500/30 transition-all"
                                                    >
                                                        <h4 className="text-white font-semibold text-sm mb-2">{rec.title}</h4>
                                                        <p className="text-slate-300 text-xs sm:text-sm mb-3 line-clamp-2">{rec.description}</p>
                                                        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                                                            <span className="text-slate-400 whitespace-nowrap">Invest: ₹{rec.amount.toLocaleString()}</span>
                                                            <span className="text-green-400 font-semibold whitespace-nowrap">Save: ₹{rec.taxSaving.toLocaleString()}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Educational Components */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                <TaxSavingTipsCard />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                <TaxDeductionsGuide />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="px-3 py-4 md:px-6 md:py-6 flex flex-col min-h-screen">
                <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <motion.button
                            onClick={onBack}
                            className="flex items-center gap-2 mb-4 sm:mb-5 transition-colors text-xs sm:text-sm"
                            style={{ color: '#94A3B8' }}
                            whileHover={{ x: -5, color: '#E2E8F0' }}
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span>Back to Dashboard</span>
                        </motion.button>

                        <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: '#1F2A37' }}
                            >
                                <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight" style={{ color: '#E2E8F0', letterSpacing: '-0.02em' }}>
                                    AI Tax Saver Planner
                                </h1>
                                <p className="text-xs sm:text-sm mt-1" style={{ color: '#94A3B8' }}>
                                    Optimize your tax savings with AI
                                </p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-6 sm:mb-8">
                            <div className="flex items-center justify-between mb-2.5 gap-2">
                                <span className="text-xs sm:text-sm font-medium" style={{ color: '#E2E8F0' }}>
                                    Step {currentStep} of {totalSteps}
                                </span>
                                <span className="text-xs sm:text-sm font-medium" style={{ color: '#94A3B8' }}>
                                    {getCompletionPercentage()}%
                                </span>
                            </div>
                            <div className="w-full h-2 rounded-full" style={{ backgroundColor: '#1F2A37' }}>
                                <motion.div
                                    className="h-2 rounded-full"
                                    style={{ backgroundColor: '#0D9488' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getCompletionPercentage()}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        {/* Step Title */}
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                                {stepTitles[currentStep as keyof typeof stepTitles]}
                            </h2>
                            <p className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>
                                {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
                            </p>
                        </div>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border text-xs sm:text-sm"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Step Content */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="mb-4 sm:mb-6 overflow-y-auto max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-280px)]"
                    >
                        <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border" style={{ backgroundColor: '#1F2A37', borderColor: '#334155' }}>
                            {renderStep()}
                        </div>
                    </motion.div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 sm:gap-4 mt-auto pt-2 sm:pt-4">
                        {currentStep > 1 && (
                            <motion.button
                                onClick={prevStep}
                                className="flex-1 px-4 py-3 sm:py-3.5 rounded-lg border transition-all font-medium text-xs sm:text-sm min-h-[44px]"
                                style={{
                                    borderColor: '#334155',
                                    backgroundColor: '#1F2A37',
                                    color: '#E2E8F0',
                                }}
                                whileHover={{ backgroundColor: '#334155' }}
                            >
                                Previous
                            </motion.button>
                        )}
                        <motion.button
                            onClick={nextStep}
                            className="flex-1 px-4 py-3 sm:py-3.5 rounded-lg transition-all font-medium text-xs sm:text-sm min-h-[44px]"
                            style={{
                                backgroundColor: '#0D9488',
                                color: '#FFFFFF',
                            }}
                            whileHover={{ backgroundColor: '#0F766E' }}
                        >
                            {currentStep === totalSteps ? 'Generate Plan' : 'Next'}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaxSaverPlanner
