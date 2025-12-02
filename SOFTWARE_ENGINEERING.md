# FinSync - Software Engineering Documentation

## Table of Contents
1. [Software Development Life Cycle (SDLC)](#software-development-life-cycle)
2. [Requirements Analysis](#requirements-analysis)
3. [System Design & Architecture](#system-design--architecture)
4. [Design Patterns & Principles](#design-patterns--principles)
5. [Implementation Details](#implementation-details)
6. [Testing & Quality Assurance](#testing--quality-assurance)
7. [Project Management](#project-management)
8. [Risk Analysis & Mitigation](#risk-analysis--mitigation)
9. [Maintenance & Scalability](#maintenance--scalability)
10. [Deployment Strategy](#deployment-strategy)

---

## Software Development Life Cycle (SDLC)

### 1. Methodology: **Agile (Iterative Development)**

We followed an **Agile methodology** with iterative sprints to build FinSync incrementally.

#### Sprint Breakdown:

**Sprint 1: Foundation & Authentication**
- User authentication system
- Database schema design
- Basic UI framework
- Navigation structure

**Sprint 2: Portfolio Management**
- Portfolio CRUD operations
- Stock search functionality
- Real-time price integration
- Holdings visualization

**Sprint 3: AI Integration**
- AI-powered recommendations
- Investment planner
- Prediction API integration
- Retry mechanisms

**Sprint 4: Advanced Features**
- Financial freedom planner
- Tax saver planner
- AI chatbot
- Profit/loss analysis

**Sprint 5: Polish & Optimization**
- UI/UX enhancements
- Performance optimization
- Bug fixes
- Documentation

### 2. Development Process Flow

```
Requirements Gathering → Design → Implementation → Testing → Deployment
         ↓                ↓           ↓              ↓           ↓
    User Stories    Architecture   Code Review   Unit Tests   Production
                    Database        Integration   Integration  Monitoring
                    API Design      Debugging     E2E Tests
```

---

## Requirements Analysis

### 1. Functional Requirements

#### FR1: User Management
- **FR1.1**: Users shall be able to register with email and password
- **FR1.2**: Users shall be able to login with Google OAuth
- **FR1.3**: Users shall complete a profile questionnaire
- **FR1.4**: System shall maintain user sessions securely

#### FR2: Portfolio Management
- **FR2.1**: Users shall add stocks to portfolio with quantity and price
- **FR2.2**: Users shall remove stocks from portfolio
- **FR2.3**: System shall track average purchase price per stock
- **FR2.4**: System shall display real-time current prices

#### FR3: Data Visualization
- **FR3.1**: System shall display portfolio distribution as pie chart
- **FR3.2**: System shall show profit/loss with bar charts
- **FR3.3**: System shall provide visual price comparisons

#### FR4: AI-Powered Recommendations
- **FR4.1**: System shall generate personalized investment strategies
- **FR4.2**: System shall provide asset allocation recommendations
- **FR4.3**: System shall suggest specific stock tickers
- **FR4.4**: System shall retry failed AI requests automatically

#### FR5: Financial Planning
- **FR5.1**: System shall calculate financial freedom timeline
- **FR5.2**: System shall optimize tax savings
- **FR5.3**: System shall provide AI chatbot for financial queries

### 2. Non-Functional Requirements

#### NFR1: Performance
- **NFR1.1**: Dashboard shall load within 3 seconds
- **NFR1.2**: API responses shall complete within 5 seconds
- **NFR1.3**: System shall handle batch requests efficiently

#### NFR2: Reliability
- **NFR2.1**: System shall retry failed external API calls up to 10 times
- **NFR2.2**: System shall have 99% uptime
- **NFR2.3**: System shall gracefully handle API failures

#### NFR3: Security
- **NFR3.1**: Passwords shall be hashed using bcrypt
- **NFR3.2**: JWT tokens shall expire after 24 hours
- **NFR3.3**: API keys shall be environment variables
- **NFR3.4**: All API routes shall require authentication

#### NFR4: Usability
- **NFR4.1**: UI shall be responsive on mobile and desktop
- **NFR4.2**: Loading states shall be visible for all async operations
- **NFR4.3**: Error messages shall be user-friendly

#### NFR5: Maintainability
- **NFR5.1**: Code shall follow TypeScript strict mode
- **NFR5.2**: Functions shall be modular and reusable
- **NFR5.3**: Components shall follow single responsibility principle

---

## System Design & Architecture

### 1. Architectural Pattern: **3-Tier Architecture**

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI)         │
│  - Next.js React Components         │
│  - Tailwind CSS Styling             │
│  - Framer Motion Animations         │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│   Application Layer (Business)      │
│  - Next.js API Routes               │
│  - Authentication Logic             │
│  - Business Rules                   │
│  - External API Integration         │
└─────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────┐
│      Data Layer (Persistence)       │
│  - Supabase PostgreSQL              │
│  - External Stock API               │
│  - Session Storage                  │
└─────────────────────────────────────┘
```

### 2. System Architecture Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ HTTPS
       ↓
┌──────────────────────────────────┐
│      Next.js Server              │
│  ┌────────────────────────────┐  │
│  │  Authentication Middleware │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │     API Route Handlers     │  │
│  │  - /api/user/*            │  │
│  │  - /api/stocks/*          │  │
│  │  - /api/portfolio/*       │  │
│  │  - /api/ai/*              │  │
│  └────────────────────────────┘  │
└───────┬──────────────┬───────────┘
        │              │
        ↓              ↓
┌──────────────┐  ┌─────────────────┐
│   Supabase   │  │  External APIs  │
│  PostgreSQL  │  │  - Stock API    │
│  + Auth      │  │  - Groq AI      │
└──────────────┘  └─────────────────┘
```

### 3. Component Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/         # Main dashboard
│   ├── profile-setup/     # Questionnaire
│   ├── api/              # Backend API routes
│   │   ├── user/
│   │   ├── stocks/
│   │   ├── portfolio/
│   │   ├── predict/
│   │   └── ai/
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── ui/              # UI primitives
│   ├── portfolio/       # Portfolio-specific
│   └── ai/              # AI-related
├── lib/                 # Utility functions
│   ├── auth.ts
│   ├── stocks.ts
│   └── db.ts
└── types/               # TypeScript types
```

### 4. Database Schema (ER Diagram)

```
┌─────────────────┐        ┌──────────────────┐
│     users       │        │   portfolio      │
├─────────────────┤        ├──────────────────┤
│ id (PK)         │───────<│ id (PK)          │
│ email           │        │ user_id (FK)     │
│ full_name       │        │ symbol           │
│ age             │        │ name             │
│ risk_score      │        │ quantity         │
│ annual_income   │        │ average_price    │
│ created_at      │        │ current_price    │
└─────────────────┘        │ created_at       │
                           └──────────────────┘

┌─────────────────┐
│  transactions   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │───┐
│ type            │   │
│ symbol          │   └──> References users.id
│ quantity        │
│ price           │
│ created_at      │
└─────────────────┘
```

---

## Design Patterns & Principles

### 1. Design Patterns Implemented

#### **1.1 Repository Pattern**
- **Purpose**: Abstract data access logic
- **Implementation**: `lib/stocks.ts`, `lib/auth.ts`
- **Benefits**: Separation of concerns, easier testing

```typescript
// Example: Stock Repository
export async function getStockQuote(symbol: string, token: string) {
  const response = await fetch(`/api/stocks/quote?symbol=${symbol}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}
```

#### **1.2 Singleton Pattern**
- **Purpose**: Single database connection instance
- **Implementation**: Supabase client
- **Benefits**: Resource efficiency, consistency

```typescript
// lib/db.ts
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
export default supabase
```

#### **1.3 Factory Pattern**
- **Purpose**: Create different types of planners
- **Implementation**: AI planner components
- **Benefits**: Flexibility, extensibility

```typescript
function createPlanner(type: 'investment' | 'freedom' | 'tax') {
  switch(type) {
    case 'investment': return <InvestmentPlanner />
    case 'freedom': return <FreedomPlanner />
    case 'tax': return <TaxPlanner />
  }
}
```

#### **1.4 Observer Pattern**
- **Purpose**: React to state changes
- **Implementation**: React hooks (useState, useEffect)
- **Benefits**: Reactive UI updates

```typescript
useEffect(() => {
  // Observe authToken changes
  if (authToken) {
    loadDashboardData()
  }
}, [authToken])
```

#### **1.5 Strategy Pattern**
- **Purpose**: Different retry strategies
- **Implementation**: Exponential backoff in fetchWithRetry
- **Benefits**: Configurable behavior

```typescript
async function fetchWithRetry(url, options, retries, delay) {
  // Strategy: Exponential backoff
  for (let i = 0; i < retries; i++) {
    // ... attempt
    delay *= 2 // Exponential increase
  }
}
```

#### **1.6 Decorator Pattern**
- **Purpose**: Add authentication to API routes
- **Implementation**: Middleware wrappers
- **Benefits**: Reusable authentication logic

```typescript
function withAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    return handler(req, res)
  }
}
```

### 2. SOLID Principles

#### **S - Single Responsibility Principle**
Each component/function has ONE clear purpose:
- `StockSearchDialog` - Only handles stock search
- `PortfolioManager` - Only manages portfolio
- `getPredictData()` - Only fetches prediction data

#### **O - Open/Closed Principle**
Components are open for extension, closed for modification:
- Add new planner types without modifying existing code
- Extend AI features without changing core logic

#### **L - Liskov Substitution Principle**
Subcomponents can replace parent without breaking:
- All planner components follow same interface
- Any chart component can be swapped

#### **I - Interface Segregation Principle**
Interfaces are specific, not bloated:
- `StockQuote` interface only has quote data
- `Portfolio` interface only has holding data
- No unused properties

#### **D - Dependency Inversion Principle**
High-level modules don't depend on low-level:
- Dashboard depends on abstractions (hooks)
- API routes depend on interfaces, not implementations

### 3. Other Software Engineering Principles

#### **DRY (Don't Repeat Yourself)**
- Reusable `fetchWithRetry` function
- Shared UI components (Button, Card, etc.)
- Common authentication logic

#### **KISS (Keep It Simple, Stupid)**
- Simple component structure
- Clear naming conventions
- Direct data flow

#### **YAGNI (You Aren't Gonna Need It)**
- Build features only when needed
- No over-engineering
- Incremental development

---

## Implementation Details

### 1. Technology Stack Justification

| Technology | Reason for Selection |
|-----------|---------------------|
| **Next.js 14** | SSR for SEO, API routes, file-based routing, React 18 features |
| **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| **Tailwind CSS** | Rapid development, consistent design, small bundle size |
| **Supabase** | Managed PostgreSQL, built-in auth, real-time capabilities |
| **Framer Motion** | Smooth animations, gesture support, declarative API |
| **Recharts** | React-native charts, customizable, lightweight |

### 2. Code Quality Measures

#### **2.1 Type Safety**
```typescript
// All functions have explicit types
async function getStockQuote(
  symbol: string, 
  token: string
): Promise<StockQuote> {
  // ...
}
```

#### **2.2 Error Handling**
```typescript
try {
  const data = await fetchData()
} catch (error) {
  console.error('Specific error context:', error)
  // Graceful fallback
}
```

#### **2.3 Code Documentation**
```typescript
/**
 * Fetches stock quote with retry logic
 * @param symbol - Stock ticker symbol
 * @param token - JWT authentication token
 * @returns Promise resolving to StockQuote object
 */
```

#### **2.4 Modular Architecture**
- Each feature in separate directory
- Shared utilities in `/lib`
- Reusable components in `/components`

### 3. State Management Strategy

```
┌──────────────────────────────────┐
│      Component State             │
│  - Local UI state (useState)     │
│  - Form inputs                   │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│     Application State            │
│  - User auth (Context)           │
│  - Portfolio data (useEffect)    │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│      Server State                │
│  - Database (Supabase)           │
│  - API responses (React hooks)   │
└──────────────────────────────────┘
```

---

## Testing & Quality Assurance

### 1. Testing Strategy

```
Testing Pyramid:
    
        /\
       /E2E\         <- Integration/E2E Tests (Manual)
      /------\
     /API Test\      <- API Route Testing
    /----------\
   /  Unit Tests \   <- Component/Function Testing
  /--------------\
```

### 2. Test Cases (Manual Testing)

#### **TC1: User Registration**
- **Test ID**: TC-AUTH-001
- **Precondition**: User not registered
- **Steps**: 
  1. Navigate to signup page
  2. Enter email, password, name
  3. Submit form
- **Expected**: Account created, redirected to profile setup
- **Status**: ✅ Pass

#### **TC2: Add Stock to Portfolio**
- **Test ID**: TC-PORT-001
- **Precondition**: User logged in
- **Steps**:
  1. Open stock search dialog
  2. Search for "RELIANCE"
  3. Click add button
  4. Enter quantity and price
- **Expected**: Stock added, visible in portfolio
- **Status**: ✅ Pass

#### **TC3: AI Prediction Retry**
- **Test ID**: TC-AI-001
- **Precondition**: External API slow/failing
- **Steps**:
  1. Load dashboard
  2. Observe AI section
- **Expected**: Loading spinner, automatic retries, eventual data load
- **Status**: ✅ Pass

### 3. Quality Assurance Checklist

- [x] All TypeScript strict mode enabled
- [x] No console errors in production
- [x] Responsive on mobile (375px) and desktop (1920px)
- [x] All forms have validation
- [x] Loading states for async operations
- [x] Error boundaries for graceful failures
- [x] Secure authentication (JWT, HTTPS)
- [x] API rate limiting considered
- [x] Input sanitization implemented
- [x] CORS properly configured

---

## Project Management

### 1. Version Control Strategy

#### **Branching Model: Git Flow**

```
main (production)
  ├── develop (integration)
  │   ├── feature/user-auth
  │   ├── feature/portfolio
  │   ├── feature/ai-integration
  │   └── feature/visualizations
  └── hotfix/api-retry-fix
```

#### **Commit Message Convention**
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(auth): add Google OAuth integration
```

### 2. Task Management

#### **User Stories**

**US1: As a user, I want to track my stock portfolio so I can monitor my investments**
- **Acceptance Criteria**:
  - Can add stocks with quantity and price
  - Can view current prices
  - Can see profit/loss calculation

**US2: As a user, I want AI recommendations so I can make informed investment decisions**
- **Acceptance Criteria**:
  - System provides asset allocation
  - Recommendations based on risk profile
  - Displays specific stock tickers

**US3: As a user, I want to plan for financial freedom so I can achieve my goals**
- **Acceptance Criteria**:
  - Can input current finances
  - System calculates timeline
  - Provides yearly targets

### 3. Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Planning | Week 1 | Requirements, architecture design |
| Sprint 1 | Week 2-3 | Authentication, database setup |
| Sprint 2 | Week 4-5 | Portfolio management, stock API |
| Sprint 3 | Week 6-7 | AI integration, predictions |
| Sprint 4 | Week 8-9 | Additional planners, chatbot |
| Sprint 5 | Week 10 | Polish, optimization, docs |

---

## Risk Analysis & Mitigation

### 1. Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| External API downtime | High | High | Implement retry logic, fallback data |
| Authentication breach | Low | Critical | JWT expiry, HTTPS only, input validation |
| Database failure | Low | High | Supabase backup, error handling |
| Performance issues | Medium | Medium | Lazy loading, batch requests, caching |
| Type errors | Medium | Low | TypeScript strict mode, code review |

### 2. Non-Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | Medium | Medium | Strict sprint planning, MVP focus |
| API cost overrun | Low | Medium | Monitor usage, implement rate limiting |
| User adoption | Medium | Low | User-friendly UI, comprehensive docs |

---

## Maintenance & Scalability

### 1. Scalability Considerations

#### **Horizontal Scaling**
- Next.js serverless functions auto-scale
- Supabase manages database scaling
- CDN for static assets

#### **Performance Optimization**
```typescript
// 1. Code Splitting
const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <LoadingSpinner />
})

// 2. Memoization
const expensiveCalculation = useMemo(() => {
  return calculatePortfolioValue(holdings)
}, [holdings])

// 3. Debouncing
const debouncedSearch = useDebounce(searchTerm, 500)
```

#### **Caching Strategy**
- Session cookies for external API
- useRef for preventing duplicate loads
- Browser localStorage for watchlist

### 2. Maintainability Features

#### **2.1 Documentation**
- Inline code comments
- README with setup instructions
- API documentation
- Architecture diagrams

#### **2.2 Logging & Monitoring**
```typescript
console.log('Loading predict data... (attempt ${count})')
console.error('Failed to fetch:', error)
console.warn('Retrying after delay...')
```

#### **2.3 Configuration Management**
```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
GROQ_API_KEY=...
JWT_SECRET=...
```

---

## Deployment Strategy

### 1. Deployment Architecture

```
Developer → Git Push → GitHub → Vercel → Production
                         ↓
                    Automated Build
                         ↓
                    Run Type Checks
                         ↓
                    Deploy to CDN
```

### 2. Environment Strategy

| Environment | Purpose | URL |
|------------|---------|-----|
| Development | Local testing | localhost:3000 |
| Staging | Pre-production testing | staging.finsync.app |
| Production | Live users | finsync.app |

### 3. CI/CD Pipeline (Proposed)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run TypeScript check
      - Build application
      - Deploy to Vercel
```

---

## Software Engineering Lessons Learned

### 1. Technical Insights

✅ **What Worked Well:**
- TypeScript caught many errors during development
- Component-based architecture easy to maintain
- Retry logic improved reliability significantly
- Supabase simplified authentication

⚠️ **Challenges Faced:**
- External API authentication complexity
- Managing multiple async state updates
- Tab switching causing unnecessary reloads
- Balancing feature richness with performance

### 2. Best Practices Applied

1. **Separation of Concerns**: UI, business logic, and data separate
2. **Reusability**: Shared components and utilities
3. **Type Safety**: Strict TypeScript for fewer bugs
4. **Error Handling**: Graceful degradation on failures
5. **User Experience**: Loading states, retry mechanisms
6. **Security**: JWT tokens, environment variables
7. **Performance**: Batch requests, conditional rendering

### 3. Future Improvements

- [ ] Implement comprehensive unit tests (Jest)
- [ ] Add integration tests (Cypress)
- [ ] Set up automated CI/CD pipeline
- [ ] Implement proper logging service (e.g., Sentry)
- [ ] Add API rate limiting
- [ ] Implement caching layer (Redis)
- [ ] Create admin dashboard
- [ ] Add analytics tracking

---

## Conclusion

FinSync demonstrates application of core **Software Engineering principles**:

1. **Requirements Engineering**: Clear functional and non-functional requirements
2. **Software Design**: 3-tier architecture, design patterns, SOLID principles
3. **Implementation**: Clean code, type safety, modular structure
4. **Testing**: Manual testing with defined test cases
5. **Project Management**: Agile methodology, sprint planning
6. **Quality Assurance**: Code reviews, error handling, validation
7. **Risk Management**: Identified risks with mitigation strategies
8. **Deployment**: Environment strategy, scalability planning
9. **Maintenance**: Documentation, logging, configuration management

The project showcases a **professional software development approach** suitable for real-world production applications.

---

**Project**: FinSync - AI-Powered Portfolio Management
**Course**: Software Engineering
**Tools**: Next.js, TypeScript, Supabase, Groq AI
**Methodology**: Agile with Iterative Development
**Author**: Vikas Verma
**Academic Year**: 2025
