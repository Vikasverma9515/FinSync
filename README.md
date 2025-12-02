# FinSync - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [API Endpoints](#api-endpoints)
5. [Authentication System](#authentication-system)
6. [Feature Details](#feature-details)
7. [Data Flow](#data-flow)
8. [Key Implementations](#key-implementations)

---

## Project Overview

**FinSync** is a modern, AI-powered portfolio management and financial planning web application designed to help users track investments, get personalized recommendations, and plan their financial future.

### Purpose
- **Portfolio Management**: Track stock holdings and real-time prices
- **AI-Powered Insights**: Get personalized investment strategies using AI
- **Financial Planning**: Plan for financial freedom, tax optimization, and long-term wealth
- **Real-time Data**: Live stock prices and market trends

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts (for data visualization)

### Backend
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **AI**: Groq API for AI-powered recommendations

### External APIs
- **Stock Data**: Custom Finance Portfolio Management API (Render deployment)
- **Real-time Prices**: External stock API with authentication

---

## Core Features

### 1. **Authentication & User Management**
- Sign up with email/password
- Google OAuth integration
- Session management with JWT tokens
- Profile persistence across sessions

### 2. **Dashboard**
- Portfolio overview with holdings distribution
- Live stock prices with visual indicators
- Market trends section
- Profit/loss analysis
- AI-powered investment strategy

### 3. **Portfolio Management**
- Add/remove stocks from portfolio
- Track purchase price vs current price
- Visual comparison with mini charts
- Real-time price updates
- Holdings distribution pie chart

### 4. **Stock Search & Tracking**
- Search for stocks by symbol or name
- Add stocks to watchlist
- Real-time quote fetching
- Support for Indian stocks (NSE/BSE)

### 5. **AI-Powered Features**

#### Investment Planner
- Questionnaire-based assessment
- Risk profiling
- Personalized stock recommendations
- Sector allocation suggestions
- Step-by-step investment plan

#### Financial Freedom Planner
- Savings goal calculator
- Wealth path mapping
- Freedom score calculation
- Yearly targets visualization
- Passive income projections

#### Tax Saver Planner
- Tax optimization recommendations
- Section-wise deduction tracking
- Monthly tax-saving action plan
- Tax breakdown visualization

#### AI Chatbot
- Real-time financial advice
- Portfolio analysis
- Investment queries
- Contextual suggestions

### 6. **Profit/Loss Analysis**
- Stock-wise P&L calculation
- Total portfolio performance
- Percentage gains/losses
- Visual charts for comparison

### 7. **Data Visualization**
- Pie charts for holdings distribution
- Bar charts for profit/loss
- Line charts for trends
- Mini progress bars for price movements
- Interactive tooltips

---

## API Endpoints

### Authentication APIs

#### `/api/user/login`
- **Method**: POST
- **Purpose**: User login with credentials
- **Request Body**: `{ email, password }`
- **Response**: User data + JWT token

#### `/api/user/new`
- **Method**: POST
- **Purpose**: Create new user account
- **Request Body**: `{ email, password, full_name }`
- **Response**: User created confirmation

### Stock APIs

#### `/api/stocks/quote?symbol=SYMBOL`
- **Method**: GET
- **Purpose**: Get real-time quote for a single stock
- **Authentication**: Required (Bearer token)
- **Response**: 
  ```json
  {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Limited",
    "price": 2450.50,
    "change": 15.30,
    "changePercent": 0.63,
    "timestamp": "2025-12-03T..."
  }
  ```

#### `/api/stocks/batch?symbols=SYMBOL1,SYMBOL2`
- **Method**: GET
- **Purpose**: Get quotes for multiple stocks
- **Authentication**: Required
- **Response**: Array of stock quotes

#### `/api/stocks/search?q=QUERY`
- **Method**: GET
- **Purpose**: Search stocks by name or symbol
- **Response**: Array of matching stocks

### Portfolio APIs

#### `/api/portfolio/buy`
- **Method**: POST
- **Purpose**: Add stock to portfolio
- **Request Body**: 
  ```json
  {
    "symbol": "TCS",
    "name": "Tata Consultancy Services",
    "quantity": 10,
    "price": 3500.00
  }
  ```

#### `/api/portfolio/sell`
- **Method**: POST
- **Purpose**: Remove stock from portfolio
- **Request Body**: `{ portfolio_id }`

#### `/api/portfolio/update`
- **Method**: POST
- **Purpose**: Update portfolio holdings
- **Request Body**: Portfolio update data

### AI APIs

#### `/api/predict`
- **Method**: GET
- **Purpose**: Get AI-powered investment strategy
- **Query Parameters**: 
  - Age, RiskScore, InvestmentHorizon
  - FinancialGoal, FinancialCondition
  - AnnualIncome, TotalNetWorth
  - Dependents, InvestmentKnowledge
- **Response**:
  ```json
  {
    "ai_strategy": {
      "Equity": 0.6,
      "Debt": 0.3,
      "Gold": 0.1
    },
    "final_recommendation": [
      {
        "Asset": "Large Cap Stocks",
        "Allocation": 0.4,
        "Tickers": ["RELIANCE", "TCS", "INFY"]
      }
    ],
    "user_profile": { ... }
  }
  ```

#### `/api/ai/investment-plan`
- **Method**: POST
- **Purpose**: Generate personalized investment plan
- **Request Body**: Questionnaire data
- **Response**: Detailed investment plan with steps

#### `/api/ai/financial-freedom-plan`
- **Method**: POST
- **Purpose**: Create financial freedom roadmap
- **Request Body**: Income, expenses, goals, time horizon
- **Response**: Wealth path map with yearly targets

#### `/api/ai/tax-saver-plan`
- **Method**: POST
- **Purpose**: Generate tax optimization plan
- **Request Body**: Income, deductions, investment preferences
- **Response**: Tax breakdown, recommendations, monthly plan

#### `/api/ai/chat`
- **Method**: POST
- **Purpose**: AI chatbot conversation
- **Request Body**: `{ message, conversationHistory }`
- **Response**: AI response with suggestions

### Profit/Loss API

#### `/api/profit-loss`
- **Method**: POST
- **Purpose**: Calculate profit/loss for portfolio
- **Request Body**: Array of holdings with purchase data
- **Response**:
  ```json
  {
    "totalProfit": 15000.50,
    "percentage": 12.5,
    "data": [
      {
        "symbol": "RELIANCE",
        "profit": 5000,
        "profitPercent": 10.2
      }
    ]
  }
  ```

---

## Authentication System

### How It Works

1. **User Signs Up/Logs In**
   - Credentials sent to Supabase Auth
   - Supabase returns JWT token
   - Token stored in browser (httpOnly cookie)

2. **Session Management**
   - JWT token included in API requests (Authorization header)
   - Token verified on server using `jose` library
   - User ID extracted from token payload

3. **External API Authentication**
   - Secondary authentication for stock API
   - Credentials stored encrypted in database
   - Automatic re-authentication on token expiry
   - Sessions cached with cookies

4. **Authentication Flow for Stock APIs**
   ```
   Client Request
   → Next.js API Route
   → Check JWT token from Supabase
   → Login to external stock API
   → Get fresh session cookies
   → Make authenticated request to stock API
   → Return data to client
   ```

---

## Feature Details

### Portfolio Holdings with Live Prices

**How It Works:**
1. User adds stocks to portfolio with purchase price and quantity
2. Dashboard loads portfolio from Supabase database
3. For each stock, fetch current price from stock API
4. Calculate:
   - Current value = quantity × current price
   - Purchase value = quantity × average purchase price
   - Gain/Loss = current value - purchase value
   - Gain/Loss % = (gain/loss / purchase value) × 100

**Visual Elements:**
- Donut chart showing portfolio distribution by stock
- List view with purchase vs current price comparison
- Mini bar charts for visual comparison
- Color coding (green = profit, red = loss)
- Progress bars showing price movement magnitude

### AI-Powered Investment Strategy

**How It Works:**
1. User completes profile questionnaire (age, income, risk tolerance, etc.)
2. Data sent to `/api/predict` endpoint
3. Backend calls external AI API with retry logic
4. AI analyzes user profile and generates:
   - Asset allocation strategy (Equity, Debt, Gold, etc.)
   - Specific stock ticker recommendations
   - Allocation percentages for each category
5. Results displayed with:
   - Pie chart for asset allocation
   - Recommendations cards with tickers
   - User profile summary

**Retry Mechanism:**
- Initial load shows loading spinner
- If API fails, automatically retries up to 10 times
- Exponential backoff (3s, 4.5s, 6.75s, etc.)
- Keeps retrying in background without blocking dashboard

### Real-Time Stock Prices with Visuals

**How It Works:**
1. Extract stock symbols from user's portfolio
2. Batch fetch current prices via `/api/stocks/batch`
3. For each stock:
   - Display current price
   - Show daily change (₹ and %)
   - Compare with purchase price
   - Render visual indicators

**Visual Components:**
- Icon badges (TrendingUp/Down)
- Purchase price vs current price box with:
  - Labeled prices (Bought/Current)
  - Mini dual bar chart
  - Gain/loss display with △/▼ symbols
- Progress bar for today's movement
- Hover effects and animations

### Profit/Loss Analysis

**How It Works:**
1. Gather all portfolio holdings with purchase data
2. Send to `/api/profit-loss` endpoint
3. External API calculates:
   - Per-stock profit/loss
   - Total portfolio profit/loss
   - Percentage returns
4. Display using:
   - Bar chart comparing stocks
   - Total summary card
   - Color-coded values

### Financial Freedom Planner

**How It Works:**
1. User inputs current finances and goals
2. AI calculates:
   - Required monthly savings
   - Year-by-year wealth targets
   - Asset allocation over time
   - Passive income projections
3. Generates:
   - Freedom Score (0-100)
   - Wealth path visualization
   - Personalized insights
   - Milestone recommendations

### Tax Saver Planner

**How It Works:**
1. User provides income and existing investments
2. AI analyzes deductions under various sections:
   - 80C (₹1.5 lakh limit)
   - 80D (Health insurance)
   - Home loan interest
   - HRA, etc.
3. Generates:
   - Current vs optimized tax
   - Total savings amount
   - Month-by-month action plan
   - Investment recommendations
4. Visual displays:
   - Tax breakdown chart
   - Deduction tracker
   - Monthly plan timeline

### Draggable AI Chatbot

**Implementation:**
- Uses Framer Motion's `drag` prop
- Drag constraints keep button on screen
- `dragElastic` for bounce effect
- State persists during drag
- Click vs drag differentiation
- Responsive on mobile and desktop

---

## Data Flow

### Complete Request Flow Example: Adding a Stock

```
1. User enters stock symbol in search dialog
   ↓
2. Frontend calls /api/stocks/search?q=SYMBOL
   ↓
3. API route searches stock database
   ↓
4. Returns matching stocks to frontend
   ↓
5. User selects stock and clicks "Add to Portfolio"
   ↓
6. Frontend calls /api/portfolio/buy with stock details
   ↓
7. API authenticates user via JWT
   ↓
8. Creates portfolio entry in Supabase
   ↓
9. Returns success response
   ↓
10. Frontend refreshes portfolio display
   ↓
11. Fetches current price via /api/stocks/quote
   ↓
12. Updates UI with new holding and current price
```

### Real-Time Price Update Flow

```
Dashboard Load
   ↓
Extract portfolio symbols
   ↓
Call /api/stocks/batch?symbols=SYM1,SYM2,...
   ↓
API Route:
  - Authenticate with external stock API
  - Get fresh session cookie
  - Fetch prices for all symbols
  - Map to required format
   ↓
Return array of stock quotes
   ↓
Frontend updates each stock card with:
  - Current price
  - Daily change
  - Visual indicators
  - Price comparison chart
```

---

## Key Implementations

### 1. Retry Logic for APIs

```typescript
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
      
      // Retry on 5xx errors
      if (response.status < 500) return response
      
      console.warn(`Attempt ${i + 1} failed, retrying...`)
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed with error`)
    }
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // Exponential backoff
    }
  }
  throw new Error('Failed after retries')
}
```

### 2. Authentication with External API

```typescript
// Login to get session cookie
const loginResponse = await fetch(EXTERNAL_API + '/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// Extract fresh cookie
const freshCookies = loginResponse.headers.get('set-cookie')

// Use cookie in subsequent requests
const stockResponse = await fetch(EXTERNAL_API + '/stocks/' + symbol, {
  headers: {
    'Cookie': freshCookies.split(';')[0]
  }
})
```

### 3. Conditional Data Loading (Prevent Tab Switch Reload)

```typescript
const hasLoadedData = useRef(false)

useEffect(() => {
  // Only load if not already loaded
  if (!hasLoadedData.current) {
    loadData()
    hasLoadedData.current = true
  }
}, [dependencies])
```

### 4. Dynamic Class Names for Scroll

```typescript
<div className={`space-y-3 ${
  customStocks.length > 5 
    ? 'max-h-[500px] overflow-y-auto pr-2' 
    : ''
}`}>
```

### 5. Purchase vs Current Price Calculation

```typescript
const holding = holdings.find(h => h.symbol === stock.symbol)
const purchasePrice = holding?.average_price || stock.price
const currentPrice = stock.price
const priceGain = currentPrice - purchasePrice
const priceGainPercent = ((priceGain / purchasePrice) * 100)
const isProfitable = priceGain >= 0
```

---

## Database Schema

### Users Table
```sql
- id (uuid, primary key)
- email (varchar)
- full_name (varchar)
- age (integer)
- risk_score (integer)
- investment_horizon (integer)
- financial_goal (integer)
- annual_income (decimal)
- created_at (timestamp)
```

### Portfolio Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- symbol (varchar)
- name (varchar)
- quantity (integer)
- average_price (decimal)
- current_price (decimal)
- purchase_date (date)
- created_at (timestamp)
```

---

## Performance Optimizations

1. **Batch API Calls**: Fetch multiple stock prices in single request
2. **Retry Logic**: Handle flaky external APIs gracefully
3. **Ref Tracking**: Prevent unnecessary data reloads on tab switch
4. **Conditional Rendering**: Only show scroll when needed
5. **Debouncing**: Limit search API calls during typing
6. **Lazy Loading**: Load AI features only when needed
7. **Cookie Reuse**: Cache session cookies to reduce auth calls

---

## Future Enhancements

- [ ] Real-time WebSocket price updates
- [ ] Historical price charts with technical indicators
- [ ] Portfolio rebalancing suggestions
- [ ] Dividend tracking
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Export portfolio reports (PDF)
- [ ] Social features (share strategies)

---

## Conclusion

FinSync is a comprehensive financial management platform that combines:
- **Modern Web Technologies** (Next.js, TypeScript, Tailwind)
- **AI Integration** (Groq for recommendations)
- **Real-time Data** (Live stock prices)
- **Beautiful UI/UX** (Animations, charts, responsive design)
- **Robust Architecture** (Retry logic, authentication, error handling)

The application demonstrates full-stack development skills including frontend UI/UX, backend API design, database management, third-party integrations, and AI implementation.

---

**Project Repository**: Desktop/finsync
**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Supabase, Groq AI
**Author**: Vikas Verma
**Created**: December 2025
