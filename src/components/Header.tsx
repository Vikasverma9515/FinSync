'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  Sparkles,
  BarChart3,
  PieChart,
  Target,
  User,
  LogOut,
  Calculator,
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

type PlanType = 'savings' | 'deposits'

interface HeaderProps {
  className?: string
}

interface NavigationLink {
  label: string
  submenu?: boolean
  action?: string
  href?: string
  items?: PlanItem[]
}

interface PlanItem {
  planId: PlanType
  label: string
  description: string
  icon: string
  comingSoon?: boolean
}

const getNavigationLinks = (user: any): NavigationLink[] => {
  if (user) {
    // Logged in user navigation
    return [
      { label: "Dashboard", action: "dashboard" },
      { label: "All Changes", action: "changes" },
    ]
  } else {
    // Guest user navigation
    return [
      {
        label: "Products",
        submenu: true,
        items: [
          {
            planId: "savings",
            label: "High-Yield Savings",
            description: "Earn 100% RBI repo rate on your savings",
            icon: "TrendingUp",
            comingSoon: false,
          },
          {
            planId: "deposits",
            label: "Fixed Deposits",
            description: "Up to 7.75% interest with instant booking",
            icon: "Sparkles",
            comingSoon: false,
          },
        ],
      },
    ]
  }
}

const ICON_MAP = {
  TrendingUp: { component: TrendingUp, color: "#10B981" },
  Sparkles: { component: Sparkles, color: "#10B981" },
  BarChart3: { component: BarChart3, color: "#6C737A" },
  PieChart: { component: PieChart, color: "#6C737A" },
  Target: { component: Target, color: "#6C737A" },
  Calculator: { component: Calculator, color: "#6C737A" },
} as const

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    setIsSigningOut(true)
    await supabase.auth.signOut()
    setActiveDropdown(null)
    setIsMobileMenuOpen(false)
    setIsSigningOut(false)
    router.push('/')
  }

  const renderIcon = (iconName: string, isComingSoon: boolean = false) => {
    const iconData = ICON_MAP[iconName as keyof typeof ICON_MAP]
    if (!iconData) return null

    const IconComponent = iconData.component
    return (
      <IconComponent
        className="w-4 h-4"
        style={{ color: isComingSoon ? "#6C737A" : iconData.color }}
      />
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInPlansDropdown = dropdownRef.current?.contains(target)
      const isInUserDropdown = userDropdownRef.current?.contains(target)

      if (!isInPlansDropdown && !isInUserDropdown) {
        setActiveDropdown(null)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null)
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleNavigationAction = (action?: string) => {
    if (!action) return

    switch (action) {
      case "dashboard":
        router.push('/dashboard')
        break
      case "changes":
        router.push('/dashboard/changes')
        break
      default:
        break
    }
  }

  const handlePlanSelection = (planId: PlanType, comingSoon: boolean = false) => {
    if (comingSoon) return

    router.push('/plans')
    setActiveDropdown(null)
  }

  const handleMobileNavigationAction = (action?: string) => {
    handleNavigationAction(action)
    setIsMobileMenuOpen(false)
  }

  const handleMobilePlanSelection = (planId: PlanType, comingSoon: boolean = false) => {
    if (comingSoon) return

    router.push('/plans')
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <header
        className={`sticky top-0 z-50 bg-white border-b border-slate-200 ${className}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.button
              onClick={() => router.push('/')}
              className="flex items-center transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Go to homepage"
            >
              <div className="text-2xl font-bold text-slate-900">BankSync</div>
            </motion.button>

            {/* Desktop Navigation */}
            <nav
              className="hidden md:flex items-center space-x-6"
              role="navigation"
              aria-label="Main navigation"
            >
              {getNavigationLinks(user).map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  ref={link.submenu ? dropdownRef : undefined}
                >
                  {link.submenu ? (
                    <div className="group">
                      <motion.button
                        onClick={() => handleDropdownToggle(link.label)}
                        className="flex items-center space-x-1 text-sm font-medium transition-all duration-200 py-2 px-3 rounded-full border"
                        style={{
                          color: activeDropdown === link.label ? "#10B981" : "#6C737A",
                          backgroundColor: activeDropdown === link.label ? "#ECFDF5" : "transparent",
                          borderColor: activeDropdown === link.label ? "#10B981" : "transparent",
                        }}
                        whileHover={{
                          backgroundColor: "#ECFDF5",
                          borderColor: "#10B981",
                          color: "#10B981",
                        }}
                        aria-haspopup="true"
                        aria-expanded={activeDropdown === link.label}
                      >
                        <span>{link.label}</span>
                        <motion.div
                          animate={{ rotate: activeDropdown === link.label ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {activeDropdown === link.label && (
                          <motion.div
                            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3"
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            role="menu"
                          >
                            <div className="grid grid-cols-1 gap-1">
                              {link.items?.map((item, index) => (
                                <motion.button
                                  key={item.label}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePlanSelection(item.planId, item.comingSoon)
                                  }}
                                  className={`flex items-center space-x-3 p-3 hover:bg-gray-50 transition-all duration-200 w-full text-left rounded-lg ${
                                    item.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                  }`}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: index * 0.03 }}
                                  disabled={item.comingSoon}
                                  role="menuitem"
                                >
                                  {/* Icon */}
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                      backgroundColor: item.comingSoon ? "#F8F9FA" : "#ECFDF5",
                                    }}
                                  >
                                    {renderIcon(item.icon, item.comingSoon)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="font-medium text-sm"
                                        style={{
                                          color: item.comingSoon ? "#6C737A" : "#111827",
                                        }}
                                      >
                                        {item.label}
                                      </div>
                                      {item.comingSoon && (
                                        <span
                                          className="px-1.5 py-0.5 text-xs font-medium rounded"
                                          style={{
                                            backgroundColor: "#F8F9FA",
                                            color: "#6C737A",
                                          }}
                                        >
                                          Soon
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className="text-xs mt-0.5 leading-tight"
                                      style={{ color: "#6C737A" }}
                                    >
                                      {item.description}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : link.action ? (
                    <motion.button
                      onClick={() => handleNavigationAction(link.action)}
                      className="text-sm font-medium transition-all duration-200 py-2 px-3 rounded-full"
                      style={{ color: "#6C737A" }}
                      whileHover={{
                        backgroundColor: "#ECFDF5",
                        color: "#10B981",
                      }}
                    >
                      {link.label}
                    </motion.button>
                  ) : (
                    <motion.a
                      href={link.href}
                      className="text-sm font-medium transition-all duration-200 py-2 px-3 rounded-full"
                      style={{ color: "#6C737A" }}
                      whileHover={{
                        backgroundColor: "#ECFDF5",
                        color: "#10B981",
                      }}
                    >
                      {link.label}
                    </motion.a>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="relative">
                  <motion.button
                    onClick={() => handleDropdownToggle("user")}
                    className="hidden md:flex items-center space-x-2 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-full"
                    style={{
                      backgroundColor: activeDropdown === "user" ? "#ECFDF5" : "transparent",
                      color: "#6C737A",
                    }}
                    whileHover={{
                      backgroundColor: "#ECFDF5",
                      color: "#10B981",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#ECFDF5" }}
                    >
                      <User className="w-4 h-4" style={{ color: "#10B981" }} />
                    </div>
                    <span className="max-w-24 truncate">{userDisplayName}</span>
                    <motion.div
                      animate={{ rotate: activeDropdown === "user" ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div
                        ref={userDropdownRef}
                        className="absolute top-full right-0 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] mt-2 p-2"
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="p-3 border-b border-slate-200">
                          <div className="text-sm font-medium text-slate-900">
                            {user?.user_metadata?.full_name || userDisplayName}
                          </div>
                          <div className="text-xs mt-0.5 truncate text-slate-600">
                            {user?.email}
                          </div>
                        </div>
                        <motion.button
                          onClick={() => router.push('/profile-setup')}
                          className="flex items-center w-full px-3 py-2 text-sm transition-all duration-150 rounded-lg m-1 text-slate-600"
                          whileHover={{ backgroundColor: "#F8F9FA" }}
                        >
                          <User className="w-4 h-4 mr-2" />
                          <span>My Profile</span>
                        </motion.button>
                        <motion.button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="flex items-center w-full px-3 py-2 text-sm transition-all duration-150 disabled:opacity-50 rounded-lg m-1 text-slate-600"
                          whileHover={{ backgroundColor: "#F8F9FA" }}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <motion.button
                    onClick={() => router.push('/login')}
                    className="hidden md:block text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg text-slate-600"
                    whileHover={{
                      backgroundColor: "#ECFDF5",
                      color: "#10B981",
                    }}
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/signup')}
                    className="hidden md:flex items-center gap-2 text-sm font-medium py-2 px-4 rounded-full transition-all duration-200 bg-slate-900 text-white"
                    whileHover={{
                      backgroundColor: "#1F2937",
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Target className="w-4 h-4" />
                    <span>Get Started</span>
                  </motion.button>
                </>
              )}

              {/* Mobile menu button */}
              <motion.button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg transition-all duration-200 text-slate-600"
                whileHover={{
                  backgroundColor: "#ECFDF5",
                  color: "#10B981",
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 180 }}
                      exit={{ rotate: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 180 }}
                      animate={{ rotate: 0 }}
                      exit={{ rotate: 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden border-t border-slate-200 py-4 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {getNavigationLinks(user).map((link, linkIndex) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: linkIndex * 0.05 }}
                  >
                    {link.submenu ? (
                      <div>
                        <motion.button
                          onClick={() => handleDropdownToggle(link.label)}
                          className="flex items-center justify-between w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 text-slate-600"
                          style={{
                            backgroundColor: activeDropdown === link.label ? "#ECFDF5" : "transparent",
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{link.label}</span>
                          <motion.div
                            animate={{ rotate: activeDropdown === link.label ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {activeDropdown === link.label && (
                            <motion.div
                              className="mt-2 space-y-1 pl-3"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {link.items?.map((item, itemIndex) => (
                                <motion.button
                                  key={item.label}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMobilePlanSelection(item.planId, item.comingSoon)
                                  }}
                                  className={`flex items-center space-x-3 p-2 w-full text-left rounded-lg transition-all duration-200 ${
                                    item.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                                  }`}
                                  style={{ backgroundColor: "#F8F9FA" }}
                                  disabled={item.comingSoon}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.15, delay: itemIndex * 0.03 }}
                                  whileTap={!item.comingSoon ? { scale: 0.98 } : {}}
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{
                                      backgroundColor: item.comingSoon ? "#F1F3F4" : "#ECFDF5",
                                    }}
                                  >
                                    {renderIcon(item.icon, item.comingSoon)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="font-medium text-xs"
                                        style={{
                                          color: item.comingSoon ? "#6C737A" : "#111827",
                                        }}
                                      >
                                        {item.label}
                                      </div>
                                      {item.comingSoon && (
                                        <span
                                          className="px-1.5 py-0.5 text-xs font-medium rounded"
                                          style={{
                                            backgroundColor: "#E5E7EB",
                                            color: "#6C737A",
                                          }}
                                        >
                                          Soon
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs mt-0.5 leading-tight text-slate-600">
                                      {item.description}
                                    </div>
                                  </div>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : link.action ? (
                      <motion.button
                        onClick={() => handleMobileNavigationAction(link.action)}
                        className="block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 text-slate-600"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ backgroundColor: "#ECFDF5" }}
                      >
                        {link.label}
                      </motion.button>
                    ) : (
                      <motion.a
                        href={link.href}
                        className="block text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 text-slate-600"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ backgroundColor: "#ECFDF5" }}
                      >
                        {link.label}
                      </motion.a>
                    )}
                  </motion.div>
                ))}

                {/* Mobile Auth Section */}
                <motion.div
                  className="pt-3 border-t border-slate-200 space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 py-2 px-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: "#ECFDF5" }}
                        >
                          <User className="w-4 h-4" style={{ color: "#10B981" }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user?.user_metadata?.full_name || userDisplayName}
                          </div>
                          <div className="text-xs text-slate-600 truncate">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => {
                          router.push('/profile-setup')
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm transition-all duration-150 rounded-lg text-slate-600"
                        whileHover={{ backgroundColor: "#F8F9FA" }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        <span>My Profile</span>
                      </motion.button>
                      <motion.button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex items-center w-full px-3 py-2 text-sm transition-all duration-150 disabled:opacity-50 rounded-lg text-slate-600"
                        whileHover={{ backgroundColor: "#F8F9FA" }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <motion.button
                        onClick={() => {
                          router.push('/login')
                          setIsMobileMenuOpen(false)
                        }}
                        className="block w-full text-left text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 text-slate-600"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ backgroundColor: "#ECFDF5" }}
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          router.push('/signup')
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center justify-center gap-2 w-full text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 bg-slate-900 text-white"
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ backgroundColor: "#1F2937" }}
                      >
                        <Target className="w-4 h-4" />
                        <span>Get Started</span>
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}

export default Header