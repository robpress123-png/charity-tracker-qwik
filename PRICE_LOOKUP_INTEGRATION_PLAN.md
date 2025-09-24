# Stock & Crypto Price Lookup Integration Plan

## Executive Summary
Implement automatic fair market value (FMV) lookup for stock and cryptocurrency donations to ensure accurate tax deduction values.

---

## 1. STOCK PRICE LOOKUP

### Data Requirements
- **Closing price** for the date of donation
- **Ticker symbol** validation
- **Corporate actions** (splits, dividends) consideration
- **Historical data** back to at least 2020

### API Options (Ranked by Cost/Features)

#### Option 1: Alpha Vantage (Free Tier Available)
- **Free:** 5 API calls/minute, 500/day
- **Premium:** $49-249/month for higher limits
- **Pros:** Good historical data, reliable
- **Cons:** Rate limits on free tier
```javascript
// Example API call
fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}`)
```

#### Option 2: IEX Cloud
- **Free:** Limited sandbox data
- **Paid:** Starting at $19/month
- **Pros:** Professional-grade data
- **Cons:** More expensive for production

#### Option 3: Yahoo Finance (Via RapidAPI)
- **Cost:** $10-500/month depending on calls
- **Pros:** Comprehensive data
- **Cons:** Terms of service considerations

#### Option 4: Polygon.io
- **Free:** 5 API calls/minute
- **Paid:** $29-199/month
- **Pros:** Real-time and historical
- **Cons:** Complex for simple needs

### Implementation Strategy

```javascript
// Database schema addition
ALTER TABLE donations ADD COLUMN ticker_symbol TEXT;
ALTER TABLE donations ADD COLUMN share_quantity DECIMAL(10, 4);
ALTER TABLE donations ADD COLUMN price_per_share DECIMAL(10, 2);
ALTER TABLE donations ADD COLUMN price_lookup_status TEXT; -- 'pending', 'found', 'not_found', 'error'
ALTER TABLE donations ADD COLUMN price_lookup_date DATETIME;

// Workflow
1. User selects "Stock" donation type
2. New fields appear:
   - Ticker Symbol (with validation)
   - Number of Shares
   - Date of Donation
3. On save:
   - Queue price lookup job
   - Show "Fetching closing price..."
4. Background job:
   - Fetch closing price for date
   - Calculate total value
   - Update donation record
5. Display:
   - Show price per share
   - Total value (shares × price)
   - Source and timestamp
```

### UI Mockup
```
Donation Type: [Stock ▼]

Stock Details:
Ticker Symbol: [AAPL___] ✓ Apple Inc.
Number of Shares: [100____]
Donation Date: [2025-01-15]

[Fetching closing price...]
↓
Closing Price: $175.25 (as of 2025-01-15 4:00 PM EST)
Total Value: $17,525.00
```

---

## 2. CRYPTOCURRENCY PRICE LOOKUP

### Data Requirements
- **Fair Market Value** at specific date/time
- **Multiple cryptocurrencies** (BTC, ETH, etc.)
- **Exchange rate** to USD
- **IRS compliance** (use noon EST price or average of high/low)

### API Options

#### Option 1: CoinGecko (Recommended)
- **Free:** 10-30 calls/minute
- **Pro:** $129/month for more features
- **Pros:** Comprehensive, historical data
- **Cons:** Rate limits
```javascript
fetch(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}`)
```

#### Option 2: CoinMarketCap
- **Free:** 333 calls/day
- **Paid:** $79-899/month
- **Pros:** Industry standard
- **Cons:** Expensive for small apps

#### Option 3: Coinbase API
- **Free:** Public data endpoints
- **Pros:** Reliable, from major exchange
- **Cons:** Limited to Coinbase pairs

#### Option 4: CryptoCompare
- **Free:** 100,000 calls/month
- **Paid:** From $79/month
- **Pros:** Good historical data
- **Cons:** Complex pricing tiers

### Implementation Strategy

```javascript
// Database additions
ALTER TABLE donations ADD COLUMN crypto_type TEXT; -- 'BTC', 'ETH', etc.
ALTER TABLE donations ADD COLUMN crypto_quantity DECIMAL(18, 8);
ALTER TABLE donations ADD COLUMN crypto_usd_rate DECIMAL(20, 2);
ALTER TABLE donations ADD COLUMN price_source TEXT; -- 'coingecko', 'coinbase', etc.

// Workflow
1. User selects "Cryptocurrency" type
2. Fields appear:
   - Cryptocurrency: [Dropdown: BTC, ETH, etc.]
   - Quantity: [0.00000000]
   - Date & Time of donation
3. FMV Calculation:
   - Use noon EST price (IRS standard)
   - OR average of day's high/low
4. Display with disclaimer:
   "FMV calculated using noon EST price from CoinGecko"
```

### IRS Compliance Note
```
⚠️ IMPORTANT: For tax purposes, cryptocurrency FMV should be:
• The price at noon EST on donation date, OR
• Average of high and low for the day
• From a recognized exchange or aggregator
• Documented with source and timestamp
```

---

## 3. CHARITY NAVIGATOR INTEGRATION

### Overview
Charity Navigator rates charities on financial health, accountability, and transparency.

### Integration Options

#### Option 1: Direct API Integration
- **Cost:** Requires partnership/paid access
- **Implementation:** Full API integration
```javascript
// Conceptual implementation
async function getCharityRating(ein) {
  const response = await fetch(`https://api.charitynavigator.org/v2/Organizations/${ein}`, {
    headers: { 'app_id': APP_ID, 'app_key': APP_KEY }
  });
  return response.json();
}
```

#### Option 2: External Link Approach (Recommended for Start)
- **Cost:** Free
- **Implementation:** Simple link generation
```javascript
// Generate Charity Navigator lookup link
function getCharityNavigatorLink(ein, charityName) {
  const searchUrl = `https://www.charitynavigator.org/ein/${ein}`;
  return searchUrl;
}

// In UI
<button onclick="window.open('${charityNavigatorUrl}', '_blank')">
  View on Charity Navigator 🔍
</button>
```

#### Option 3: Web Scraping (Not Recommended)
- Against terms of service
- Unreliable
- Legal concerns

#### Option 4: Cached Rating Display
- Store ratings in database
- Update periodically (with permission)
- Display with attribution

### UI Integration Mockup
```
Charity: American Red Cross
EIN: 53-0196605
[★★★★☆ 91.54/100 - Charity Navigator] [View Details ↗]

Financial Score: ████████░░ 88.52
Accountability: █████████░ 96.00
Impact: ████████░░ (Not rated)
Last Updated: 2024-12-01
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Basic Setup (Week 1-2)
- [ ] Add database columns for prices
- [ ] Create API credential storage
- [ ] Build price lookup service structure

### Phase 2: Stock Integration (Week 3-4)
- [ ] Select and subscribe to stock API
- [ ] Implement ticker validation
- [ ] Build price lookup workflow
- [ ] Add to donation form
- [ ] Test with common stocks

### Phase 3: Crypto Integration (Week 5-6)
- [ ] Select crypto price API
- [ ] Implement crypto selection
- [ ] Build FMV calculation
- [ ] Add IRS compliance notes
- [ ] Test with BTC, ETH

### Phase 4: Charity Navigator (Week 7)
- [ ] Implement external link approach
- [ ] Add charity ratings display
- [ ] Consider API partnership
- [ ] Add to charity selection

### Phase 5: Testing & Polish (Week 8)
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Caching strategy
- [ ] Performance optimization

---

## 5. COST ANALYSIS

### Monthly API Costs (Estimated)
```
Stock API (Alpha Vantage Pro): $49/month
Crypto API (CoinGecko Pro):    $129/month
Charity Navigator:              Free (link approach)
--------------------------------
Total:                          $178/month
```

### Cost Optimization Strategies
1. **Caching:** Store prices for 24 hours
2. **Batch requests:** Group lookups
3. **Free tiers:** Start with free, upgrade as needed
4. **User limits:** Premium feature for lookups

---

## 6. FREEMIUM MODEL INTEGRATION

### Free Tier Limitations
- Manual price entry only
- No automatic lookups
- Basic charity info only

### Premium Features ($49/year)
- ✅ Automatic stock price lookup
- ✅ Crypto FMV calculation
- ✅ Charity Navigator ratings
- ✅ Historical price data
- ✅ Bulk price updates

### Implementation
```javascript
// Check user tier before lookup
if (user.account_type === 'free') {
  showManualEntryForm();
  showUpgradePrompt("Automatic price lookup is a Premium feature");
} else {
  performAutomaticLookup();
}
```

---

## 7. TECHNICAL ARCHITECTURE

### API Service Layer
```javascript
// services/priceLookup.js
class PriceLookupService {
  async getStockPrice(ticker, date) {
    // Check cache first
    // Call external API
    // Store in cache
    // Return price
  }

  async getCryptoPrice(symbol, date) {
    // Similar flow
  }

  async getCharityRating(ein) {
    // Fetch or generate link
  }
}
```

### Database Cache Table
```sql
CREATE TABLE price_cache (
  id TEXT PRIMARY KEY,
  lookup_type TEXT, -- 'stock', 'crypto'
  symbol TEXT,
  date DATE,
  price DECIMAL(20, 8),
  source TEXT,
  fetched_at DATETIME,
  INDEX idx_symbol_date (symbol, date)
);
```

### Background Job Queue
```javascript
// Queue price lookups to avoid blocking
const queue = [];

function queuePriceLookup(donationId, type, symbol, date) {
  queue.push({ donationId, type, symbol, date });
  processQueue();
}
```

---

## 8. USER EXPERIENCE FLOW

### Stock Donation Flow
1. Select "Stock" donation type
2. Enter ticker symbol → Auto-complete with company name
3. Enter shares and date
4. System shows "Fetching price..."
5. Display closing price and total
6. Allow manual override if needed

### Crypto Donation Flow
1. Select "Cryptocurrency" type
2. Choose from dropdown (BTC, ETH, etc.)
3. Enter quantity and date/time
4. System calculates FMV
5. Show source and calculation method
6. Include IRS compliance note

### Charity Selection Flow
1. Search for charity
2. See Charity Navigator rating inline
3. Click for detailed rating page
4. Confidence in donation decision

---

## 9. COMPLIANCE & LEGAL

### IRS Requirements
- Document FMV source
- Use recognized pricing sources
- Maintain audit trail
- Provide dated receipts

### Data Provider Terms
- Review API terms of service
- Ensure proper attribution
- Respect rate limits
- Consider data licensing

### User Disclaimers
```
⚠️ Tax Disclaimer: Price data is provided for reference only.
Consult your tax advisor for official valuation. Users are
responsible for verifying values for tax purposes.
```

---

## 10. FUTURE ENHANCEMENTS

### Advanced Features
- Real-time price updates
- Multi-currency support
- Options/derivatives handling
- Automatic basis calculation
- Integration with brokerages

### AI/ML Opportunities
- Predict optimal donation timing
- Tax optimization suggestions
- Charity recommendation engine
- Fraud detection

### Reporting Enhancements
- IRS Form 8283 generation
- Detailed valuation reports
- Audit trail documentation
- Multi-year analytics

---

## NEXT STEPS

1. **Evaluate API providers** - Get trial accounts
2. **Budget approval** - $178/month for APIs
3. **Legal review** - Terms and compliance
4. **Start with Phase 1** - Basic infrastructure
5. **MVP with free tiers** - Test with users
6. **Upgrade as needed** - Based on usage

---

**Document Version:** 1.0
**Created:** September 24, 2025
**Status:** Planning Phase