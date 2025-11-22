# Debug Checklist for Dashboard Data Loading

## What I've Added:
1. **Fixed isLoading state** - Now properly waits for authToken before setting isLoading to false
2. **Comprehensive logging** in dashboard component:
   - Login attempts and responses
   - Token extraction
   - Market stocks loading
   - Custom stocks loading
   - Profit/Loss loading
3. **API route logging**:
   - `/api/user/login` - logs friend API response
   - `/api/user/new` - logs friend API response
   - `/api/stocks/quote` - logs token presence and API responses
   - `/api/profit-loss` - logs token presence and API responses

## To Debug:

1. **Kill any existing dev server:**
   ```bash
   pkill -f "next dev"
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Open browser to http://localhost:3000/dashboard**

4. **Open Browser DevTools (F12) and go to Console tab**

5. **Look for these logs in order:**
   - "Attempting login with email: [your-email]"
   - "Login response status: [status code]"
   - "Login response data: [data object]"
   - "Token extracted: [token string]" - **CRITICAL** - if this is empty, token extraction failed
   - "Auth token received: [token]"
   - "Loading market stocks..."
   - "Loading custom stocks..."
   - "Loading profit/loss..."
   - Check if you see "Loading market stocks..." or errors

## Common Issues to Look For:

- **Token is empty:** Login response format mismatch - token might be nested differently
- **No logs after "Attempting login":** Login endpoint is failing
- **Token loads but no stock logs:** Second useEffect with authToken dependency isn't triggering
- **Logs show but no data renders:** API responses might be in wrong format
- **401 errors on stocks:** Token is invalid or not being sent correctly

## Server-side Logs:

Also check Terminal where `npm run dev` is running for server-side logs (they'll show there too).
