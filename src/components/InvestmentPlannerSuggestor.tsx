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
      <div className="min-h-screen" style={{ backgroundColor: "#FFFEFE" }}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Generating Plan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
      <div className="min-h-screen" style={{ backgroundColor: "#FFFEFE" }}>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-20 h-20 rounded-full mb-8 flex items-center justify-center"
              style={{ backgroundColor: "#FFEDEB" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <PieChart className="w-10 h-10 text-slate-900" />
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
                  color: "#131E29",
                  fontWeight: "400",
                  letterSpacing: "-0.01em",
                }}
              >
                Creating Your Investment Plan
              </h2>
              <p
                className="text-lg"
                style={{
                  color: "#6C737A",
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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFEFE" }}>
        {/* Header Navigation */}
        <motion.div
          className="sticky z-0 border-b lg:static bg-white"
          style={{ borderColor: "#C4C7CA", top: layoutOffset }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Back Button */}
              <motion.button
                onClick={() => {
                  setShowResults(false);
                  setError(null);
                }}
                className="p-1.5 sm:p-2 -ml-1 sm:ml-0 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft
                  className="w-4 sm:w-5 h-4 sm:h-5"
                  style={{ color: "#131E29" }}
                />
              </motion.button>

              {/* Title Section */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FFEDEB" }}
                >
                  <PieChart className="w-4 sm:w-5 lg:w-8 h-4 sm:h-5 lg:h-8 text-slate-900" />
                </div>
                <div className="min-w-0">
                  <h1
                    className="text-base sm:text-lg lg:text-2xl font-normal leading-tight"
                    style={{
                      color: "#131E29",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {generatedPlan.plan_name}
                  </h1>
                  <div className="text-xs sm:text-sm hidden sm:block" style={{ color: "#6C737A" }}>
                    Personalized Investment Plan
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <motion.button
                  onClick={generatePlan}
                  disabled={loading}
                  className="p-1.5 sm:p-2 lg:px-3 lg:py-2 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
                  style={{
                    backgroundColor: loading ? "#C4C7CA" : "#FF6A5C",
                    color: "white",
                  }}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="hidden lg:inline text-sm">
                    {loading ? "Generating..." : "Generate New"}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="w-full flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-10">
          <div className="max-w-6xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="text-center mb-10 lg:mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{ backgroundColor: "#FFEDEB", color: "#FF6A5C" }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Plan Ready</span>
                  </div>

                  <h1
                    className="text-2xl sm:text-4xl lg:text-5xl mb-4 sm:mb-6"
                    style={{
                      color: "#131E29",
                      fontWeight: "400",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Your {generatedPlan.plan_name}
                  </h1>
                  <p
                    className="text-base sm:text-xl max-w-3xl mx-auto"
                    style={{
                      color: "#6C737A",
                      fontFamily: "'Inter', -apple-system, sans-serif",
                    }}
                  >
                    {generatedPlan.description}
                  </p>
                </motion.div>

                {/* Plan Overview */}
                <motion.div
                  className="mb-6 lg:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border" style={{ borderColor: "#C4C7CA" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Expected Return</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{generatedPlan.expected_return}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border" style={{ borderColor: "#C4C7CA" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Risk Level</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 capitalize">{generatedPlan.risk_level}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border" style={{ borderColor: "#C4C7CA" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <PieChart className="w-5 h-5 text-slate-900" />
                        <span className="font-medium text-gray-900">Stocks</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{generatedPlan.recommended_stocks.length} stocks</p>
                    </div>
                  </div>
                </motion.div>

                {/* Recommended Stocks */}
                <motion.div
                  className="mb-6 lg:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Recommended Portfolio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {generatedPlan.recommended_stocks.map((stock, index) => (
                      <div key={index} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border" style={{ borderColor: "#C4C7CA" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{stock.name}</h3>
                            <p className="text-sm text-gray-600">{stock.symbol}</p>
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm font-medium">
                            {stock.allocation}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{stock.sector}</p>
                        <p className="text-sm text-gray-700">{stock.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Implementation Steps */}
                <motion.div
                  className="mb-6 lg:mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Implementation Steps</h2>
                    <button
                      onClick={() => setShowDetailedSteps(!showDetailedSteps)}
                      className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {showDetailedSteps ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {generatedPlan.steps.map((step, index) => (
                      <div key={index} className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border" style={{ borderColor: "#C4C7CA" }}>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-700 mb-3">{step.description}</p>

                            {showDetailedSteps && (
                              <>
                                <div className="mb-3">
                                  <h4 className="font-medium text-gray-900 mb-2">Actions:</h4>
                                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {step.actions.map((action, actionIndex) => (
                                      <li key={actionIndex}>{action}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    {step.timeline}
                                  </span>
                                  <span className="text-green-600 font-medium">
                                    {step.expected_outcome}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Summary */}
                <motion.div
                  className="bg-green-50 rounded-2xl p-4 lg:p-6 border border-green-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg text-green-800 mb-2">Plan Summary</h3>
                      <p className="text-green-700">{generatedPlan.summary}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="pt-4 sm:pt-6 pb-4 sm:pb-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <motion.button
                    onClick={onBack}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 rounded-lg sm:rounded-2xl font-medium transition-all"
                    style={{
                      backgroundColor: "#131E29",
                      color: "white",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back to Dashboard
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire Steps
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFEFE" }}>
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <PieChart className="w-8 h-8 text-slate-900" />
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: "#131E29" }}>
              Investment Plan Creator
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Answer a few questions and we'll create a personalized investment plan tailored to your goals and preferences.
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
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {getCompletionPercentage()}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-slate-900 h-2 rounded-full transition-all duration-300"
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
            className="bg-white rounded-2xl shadow-sm border p-6 lg:p-8"
            style={{ borderColor: "#C4C7CA" }}
          >
            <div className="mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                {stepTitles[currentStep as keyof typeof stepTitles]}
              </h2>
              <p className="text-gray-600">
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
                    color: "text-green-600",
                    bgColor: "bg-green-100"
                  },
                  {
                    id: "balanced_wealth_builder",
                    title: "Balanced Wealth Builder",
                    description: "Balanced approach with growth and stability",
                    icon: Target,
                    color: "text-blue-600",
                    bgColor: "bg-blue-100"
                  },
                  {
                    id: "conservative_income_generator",
                    title: "Conservative Income Generator",
                    description: "Focus on stable income and capital preservation",
                    icon: DollarSign,
                    color: "text-purple-600",
                    bgColor: "bg-purple-100"
                  }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleInputChange("planType", plan.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      formData.planType === plan.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${plan.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <plan.icon className={`w-6 h-6 ${plan.color}`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.title}</h3>
                        <p className="text-gray-600">{plan.description}</p>
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.experienceLevel === option
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.preferredSectors.includes(sector)
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.preferredSectors.includes(sector)
                          ? "border-slate-900 bg-slate-900"
                          : "border-gray-300"
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.investmentHorizon === option
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.riskComfort === option
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.monthlyCommitment === option
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      formData.financialGoals.includes(goal)
                        ? "border-slate-900 bg-slate-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.financialGoals.includes(goal)
                          ? "border-slate-900 bg-slate-900"
                          : "border-gray-300"
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Back" : "Previous"}
          </button>

          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              isStepValid()
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
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