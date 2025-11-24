'use client'

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Crown,
  Heart,
  Sparkles,
  Loader2,
  ArrowRight,
  CheckCircle,
  X,
  FileText,
  Target,
  Clock,
  DollarSign,
  PieChart,
} from "lucide-react";
import { generateInvestmentPlan } from "../lib/actions";
import { createClient } from "../lib/supabase";
import type {
  InvestmentQuestionnaireData,
  InvestmentPlanOutput,
  UserProfile,
} from "../types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import InvestmentBasicsCard from "./InvestmentBasicsCard";
import WhereToInvestCard from "./WhereToInvestCard";
import InvestmentDosAndDonts from "./InvestmentDosAndDonts";

interface InvestmentPlannerSuggestorProps {
  onBack: () => void;
}

const InvestmentPlannerSuggestor: React.FC<InvestmentPlannerSuggestorProps> = ({
  onBack,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvestmentQuestionnaireData>({
    planType: "growth_accelerator",
    experienceLevel: "",
    preferredSectors: [],
    investmentHorizon: "",
    riskComfort: "",
    monthlyCommitment: "",
    financialGoals: [],
  });
  const [generatedPlan, setGeneratedPlan] =
    useState<InvestmentPlanOutput | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showDetailedSteps, setShowDetailedSteps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutOffset, setLayoutOffset] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'steps' | 'learn'>('overview');

  const totalSteps = 7;

  const handleInputChange = (
    field: keyof InvestmentQuestionnaireData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field: keyof InvestmentQuestionnaireData, option: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(option)
      ? currentArray.filter((item) => item !== option)
      : [...currentArray, option];
    handleInputChange(field, newArray);
  };

  useEffect(() => {
    const returnState = localStorage.getItem("investmentReturnState");
    if (returnState && returnState !== "undefined" && returnState !== "null") {
      const parsedState = JSON.parse(returnState);
      const { formData: savedFormData, currentStep: savedStep, action } = parsedState;
      setFormData(savedFormData);
      setCurrentStep(savedStep);

      // If user just logged in and should generate plan, do it now
      if (action === 'generate_plan' && user && profile) {
        // Small delay to ensure component is fully mounted
        setTimeout(() => {
          generatePlan();
        }, 100);
      }

      localStorage.removeItem("investmentReturnState");
    }
  }, [user, profile]);

  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === "undefined") {
        return;
      }
      const globalHeader = document.querySelector('header[role="banner"]') as HTMLElement | null;
      setLayoutOffset(globalHeader?.offsetHeight || 0);
    };
    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => {
      window.removeEventListener("resize", updateOffset);
    };
  }, [showResults]);

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
    };
    loadUserData();
  }, []);

  // Check if user is logged in when component mounts - removed immediate redirect
  // Will handle login check during plan generation instead

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      await generatePlan();
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return true; // Plan type always has a default value
      case 2:
        return formData.experienceLevel !== "";
      case 3:
        return formData.preferredSectors.length > 0;
      case 4:
        return formData.investmentHorizon !== "";
      case 5:
        return formData.riskComfort !== "";
      case 6:
        return formData.monthlyCommitment !== "";
      case 7:
        return formData.financialGoals.length > 0;
      default:
        return true;
    }
  };

  const getCompletionPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const stepTitles = {
    1: "Choose Your Investment Plan",
    2: "Your Investment Experience",
    3: "Preferred Sectors",
    4: "Investment Timeline",
    5: "Risk Comfort Level",
    6: "Monthly Commitment",
    7: "Financial Goals",
  };

  const stepDescriptions = {
    1: "Select the type of investment plan that matches your objectives",
    2: "Tell us about your experience with investing",
    3: "Which sectors interest you most for investment?",
    4: "What's your investment timeline?",
    5: "How comfortable are you with investment risk?",
    6: "How much can you invest monthly?",
    7: "What are your primary financial goals?",
  };

  const generatePlan = async () => {
    if (!user || !profile) {
      // User not logged in - save form data and redirect to login
      const returnState = {
        formData,
        currentStep,
        action: 'generate_plan'
      };
      localStorage.setItem('investmentReturnState', JSON.stringify(returnState));
      window.location.href = '/login?redirect=plans';
      return;
    }

    setLoading(true);
    setError(null);
    setShowResults(true);
    setGeneratedPlan(null);

    try {
      const response = await generateInvestmentPlan(formData, profile);
      setGeneratedPlan(response);
    } catch (error) {
      console.error("Error generating plan:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
      setGeneratedPlan(null);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-rose-500 mb-4">Error Generating Plan</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => setError(null)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-full mb-8 flex items-center justify-center"
              style={{ backgroundColor: "#1F2A37" }}
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
                  color: "#E2E8F0",
                  fontWeight: "400",
                  letterSpacing: "-0.01em",
                }}
              >
                Creating Your Investment Plan
              </h2>
              <p
                className="text-lg"
                style={{
                  color: "#94A3B8",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                Our AI is crafting a personalized investment strategy based on your preferences...
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && generatedPlan) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col">
        {/* Header Navigation */}
        <motion.div
          className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-xl border-b border-slate-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setShowResults(false)}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-white truncate">
                    {generatedPlan.plan_name}
                  </h1>
                  <p className="text-xs text-slate-400 truncate">
                    {generatedPlan.risk_level} • {generatedPlan.expected_return} Return
                  </p>
                </div>
              </div>
              <button
                onClick={generatePlan}
                disabled={loading}
                className="p-2 rounded-full bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              </button>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-4 gap-2 mt-4 px-4 pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'portfolio', label: 'Portfolio', icon: PieChart },
                { id: 'steps', label: 'Steps', icon: CheckCircle },
                { id: 'learn', label: 'Learn', icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 py-2 rounded-xl text-[10px] md:text-sm font-medium transition-all ${activeTab === tab.id
                    ? 'bg-teal-500 text-navy-900'
                    : 'bg-navy-800 text-slate-400 border border-slate-700'
                    }`}
                >
                  <tab.icon className="w-4 h-4 md:w-4 md:h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Plan Summary Card */}
                    <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-5 border border-slate-700 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">Plan Summary</h2>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {generatedPlan.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 bg-navy-800/50 rounded-xl p-4 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2 text-green-400">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">Return</span>
                          </div>
                          <p className="text-lg font-bold text-white leading-tight">{generatedPlan.expected_return}</p>
                        </div>
                        <div className="bg-navy-800/50 rounded-xl p-4 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-medium">Risk</span>
                          </div>
                          <p className="text-xl font-bold text-white capitalize">{generatedPlan.risk_level}</p>
                        </div>
                        <div className="bg-navy-800/50 rounded-xl p-4 border border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2 text-teal-400">
                            <PieChart className="w-4 h-4" />
                            <span className="text-xs font-medium">Stocks</span>
                          </div>
                          <p className="text-xl font-bold text-white">{generatedPlan.recommended_stocks.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Strategy Overview */}
                    <Card className="bg-navy-800/30 border-slate-700/50">
                      <CardHeader className="p-5 pb-2">
                        <CardTitle className="text-base text-white">Strategy Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 pt-2">
                        <p className="text-sm text-slate-400 leading-relaxed">{generatedPlan.summary}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    {/* Asset Allocation */}
                    <Card className="bg-navy-800/30 border-slate-700/50 overflow-hidden">
                      <CardHeader className="p-5 border-b border-slate-700/50 bg-navy-800/50">
                        <CardTitle className="text-base text-white flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-teal-400" />
                          Asset Allocation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="space-y-4">
                          {(generatedPlan.allocation || []).map((item: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-200">{item.assetClass}</span>
                                <span className="font-bold text-teal-400">{item.percentage}%</span>
                              </div>
                              <div className="w-full bg-navy-900 rounded-full h-2">
                                <div
                                  className="bg-teal-500 h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-slate-500">{item.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommended Stocks */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Recommended Stocks</h3>
                      <div className="space-y-3">
                        {generatedPlan.recommended_stocks.map((stock, index) => (
                          <div key={index} className="bg-navy-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white">{stock.symbol}</h4>
                                  <span className="px-2 py-0.5 bg-navy-900 text-slate-400 text-[10px] rounded border border-slate-700">
                                    {stock.sector}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{stock.name}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-teal-400">{stock.allocation}%</span>
                                <p className="text-[10px] text-slate-500">Allocation</p>
                              </div>
                            </div>
                            <div className="pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-300 leading-relaxed">{stock.reasoning}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Instruments */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Other Instruments</h3>
                      <div className="space-y-3">
                        {(generatedPlan.suggestions || []).map((suggestion: any, index: number) => (
                          <div key={index} className="bg-navy-800/30 rounded-xl p-4 border border-slate-700/30">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-white text-sm">{suggestion.name}</h4>
                              <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] rounded-full border border-teal-500/20">
                                {suggestion.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{suggestion.description}</p>
                            <div className="flex justify-between text-xs text-slate-500 bg-navy-900/50 p-2 rounded-lg">
                              <span>Return: <span className="text-teal-400">{suggestion.expectedReturn}</span></span>
                              <span>Risk: <span className="text-white">{suggestion.riskLevel}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'steps' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {generatedPlan.steps.map((step, index) => (
                        <div key={index} className="relative pl-8 pb-8 last:pb-0">
                          {/* Timeline Line */}
                          <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-800 last:hidden"></div>

                          {/* Step Number Bubble */}
                          <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-teal-500 text-navy-900 flex items-center justify-center text-xs font-bold z-10 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                            {step.step_number}
                          </div>

                          <div className="bg-navy-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="font-bold text-white mb-2">{step.title}</h3>
                            <p className="text-sm text-slate-300 mb-4">{step.description}</p>

                            <div className="bg-navy-900/50 rounded-lg p-3 mb-3">
                              <h4 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Action Items</h4>
                              <ul className="space-y-2">
                                {step.actions.map((action, actionIndex) => (
                                  <li key={actionIndex} className="flex items-start gap-2 text-sm text-slate-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" />
                                {step.timeline}
                              </span>
                              <span className="text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded">
                                {step.expected_outcome}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'learn' && (
                  <div className="space-y-6">
                    <InvestmentBasicsCard riskLevel={formData.riskComfort as 'low' | 'medium' | 'high'} />
                    <WhereToInvestCard />
                    <InvestmentDosAndDonts />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire Steps
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-20">
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
              Investment Planner
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Let's create a personalized investment strategy tailored to your goals and risk tolerance.
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

            {/* Step 1: Plan Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {[
                  {
                    id: "growth_accelerator",
                    title: "Growth Accelerator Plan",
                    description: "High-growth focused portfolio for long-term wealth building",
                    icon: TrendingUp,
                    color: "text-green-400",
                    bgColor: "bg-green-900/20"
                  },
                  {
                    id: "balanced_wealth_builder",
                    title: "Balanced Wealth Builder",
                    description: "Balanced approach with growth and stability",
                    icon: Target,
                    color: "text-blue-400",
                    bgColor: "bg-blue-900/20"
                  },
                  {
                    id: "conservative_income_generator",
                    title: "Conservative Income Generator",
                    description: "Focus on stable income and capital preservation",
                    icon: DollarSign,
                    color: "text-purple-400",
                    bgColor: "bg-purple-900/20"
                  }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleInputChange("planType", plan.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${formData.planType === plan.id
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <plan.icon className={`w-6 h-6 ${plan.color}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg text-white mb-1">{plan.title}</h3>
                        <p className="text-slate-400">{plan.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Experience Level */}
            {currentStep === 2 && (
              <div className="space-y-3">
                {[
                  "Beginner - New to investing",
                  "Intermediate - Some experience with stocks",
                  "Advanced - Experienced investor"
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange("experienceLevel", option)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.experienceLevel === option
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Preferred Sectors */}
            {currentStep === 3 && (
              <div className="space-y-3">
                {[
                  "Technology",
                  "Healthcare",
                  "Financial Services",
                  "Consumer Goods",
                  "Energy",
                  "Industrials",
                  "Real Estate"
                ].map((sector) => (
                  <button
                    key={sector}
                    onClick={() => handleMultiSelect("preferredSectors", sector)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.preferredSectors.includes(sector)
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.preferredSectors.includes(sector)
                        ? "border-teal-500 bg-teal-500"
                        : "border-slate-500"
                        }`}>
                        {formData.preferredSectors.includes(sector) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {sector}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Investment Horizon */}
            {currentStep === 4 && (
              <div className="space-y-3">
                {[
                  "Short-term (1-3 years)",
                  "Medium-term (3-7 years)",
                  "Long-term (7+ years)"
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange("investmentHorizon", option)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.investmentHorizon === option
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Risk Comfort */}
            {currentStep === 5 && (
              <div className="space-y-3">
                {[
                  "Conservative - Prefer stability over high returns",
                  "Moderate - Willing to accept some risk for better returns",
                  "Aggressive - Comfortable with volatility for higher potential returns"
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange("riskComfort", option)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.riskComfort === option
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Step 6: Monthly Commitment */}
            {currentStep === 6 && (
              <div className="space-y-3">
                {[
                  "Under ₹5,000",
                  "₹5,000 - ₹15,000",
                  "₹15,000 - ₹50,000",
                  "Over ₹50,000"
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleInputChange("monthlyCommitment", option)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.monthlyCommitment === option
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {/* Step 7: Financial Goals */}
            {currentStep === 7 && (
              <div className="space-y-3">
                {[
                  "Retirement planning",
                  "Buying a home",
                  "Children's education",
                  "Emergency fund",
                  "Wealth accumulation",
                  "Passive income generation"
                ].map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleMultiSelect("financialGoals", goal)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${formData.financialGoals.includes(goal)
                      ? "border-teal-500 bg-teal-500/10 text-white"
                      : "border-slate-700 bg-navy-900 hover:border-slate-600 text-slate-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${formData.financialGoals.includes(goal)
                        ? "border-teal-500 bg-teal-500"
                        : "border-slate-500"
                        }`}>
                        {formData.financialGoals.includes(goal) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {goal}
                    </div>
                  </button>
                ))}
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
          <button
            onClick={currentStep === 1 ? onBack : prevStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-700 hover:border-slate-600 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </button>

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${isStepValid()
              ? "bg-teal-500 hover:bg-teal-600 text-navy-900"
              : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
          >
            {currentStep === totalSteps ? "Generate Plan" : "Next"}
            {currentStep !== totalSteps && <ArrowRight className="w-4 h-4" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestmentPlannerSuggestor;