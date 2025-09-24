# Freemium Business Model Strategy

## Overview
Demonstrate a freemium model without requiring actual payment processing (no Stripe integration yet).

## Free Tier Limitations
- **3 donations maximum** per tax year
- **No export functionality** (CSV/PDF disabled)
- **Basic features only** (no advanced analytics)
- **Watermark on any reports**

## Premium Tier ($29/year)
- **Unlimited donations**
- **Full export capabilities** (CSV, PDF)
- **Advanced analytics dashboard**
- **Priority support**
- **No watermarks**

## Implementation Strategy (Demo Mode)

### Phase 1: User Account Types
```javascript
// Add to user table/object
user = {
  id: 'xxx',
  email: 'user@example.com',
  account_type: 'free', // 'free' or 'premium'
  donation_count: 0,
  trial_expires: null,
  premium_expires: null
}
```

### Phase 2: Frontend Restrictions
1. **Donation Counter**: Show "2 of 3 free donations used" banner
2. **Export Buttons**: Disabled with "Premium Feature 🔒" overlay
3. **Upgrade Prompts**: Modal when hitting limits

### Phase 3: Demo Payment Flow (No Real Processing)
```javascript
// Mock payment flow
function upgradeAccount() {
  // Show payment modal
  showModal({
    title: "Upgrade to Premium",
    price: "$29/year",
    features: [...],
    buttons: [
      { text: "Demo: Instant Upgrade", action: mockUpgrade },
      { text: "Demo: Decline", action: closeModal }
    ]
  });
}

function mockUpgrade() {
  // Simulate successful payment
  user.account_type = 'premium';
  user.premium_expires = new Date(Date.now() + 365*24*60*60*1000);
  showSuccessMessage("Account upgraded! (Demo mode - no payment processed)");
  unlockAllFeatures();
}
```

### Phase 4: Backend Enforcement
```javascript
// API middleware
function checkDonationLimit(req, res, next) {
  if (user.account_type === 'free') {
    const count = await getDonationCount(user.id, currentYear);
    if (count >= 3) {
      return res.json({
        error: 'Free account limit reached',
        upgrade_required: true,
        message: 'Upgrade to Premium for unlimited donations'
      });
    }
  }
  next();
}

// Export endpoints
function exportDonations(req, res) {
  if (user.account_type === 'free') {
    return res.json({
      error: 'Premium feature',
      upgrade_required: true
    });
  }
  // Process export...
}
```

### Phase 5: Visual Indicators
1. **Navigation Bar**: Show "FREE" or "PRO" badge
2. **Dashboard**: Display upgrade benefits carousel
3. **Settings**: Account status with upgrade button
4. **Donation Form**: Warning at 2 donations, blocked at 3

### Demo Test Scenarios
1. **User 1**: Free account with 2 donations (one more allowed)
2. **User 2**: Free account at limit (3 donations, blocked)
3. **User 3**: Premium account (unlimited)
4. **User 4**: Trial premium (7 days remaining)
5. **Admin**: Bypass all restrictions

### UI Components Needed
```html
<!-- Upgrade Banner -->
<div class="upgrade-banner">
  <span>📊 You've used 2 of 3 free donations</span>
  <button onclick="showUpgradeModal()">Upgrade to Premium</button>
</div>

<!-- Feature Lock Overlay -->
<div class="feature-locked">
  <div class="lock-icon">🔒</div>
  <h3>Premium Feature</h3>
  <p>Export functionality requires a premium account</p>
  <button>Upgrade for $29/year</button>
</div>

<!-- Upgrade Modal -->
<div class="upgrade-modal">
  <h2>Unlock Full Access</h2>
  <div class="price">$29/year</div>
  <ul>
    <li>✓ Unlimited donations</li>
    <li>✓ Export to CSV & PDF</li>
    <li>✓ Advanced analytics</li>
    <li>✓ Priority support</li>
  </ul>
  <button class="demo-upgrade">Demo: Instant Upgrade (No Payment)</button>
</div>
```

### Implementation Timeline
1. **Week 1**: Add account_type to user model
2. **Week 2**: Implement donation counting/limits
3. **Week 3**: Add UI restrictions and upgrade prompts
4. **Week 4**: Create demo payment flow
5. **Week 5**: Test and refine

### Future: Real Payment Integration
When ready for production:
1. **Stripe Integration**: Replace mock with real payment
2. **Subscription Management**: Handle renewals, cancellations
3. **Invoice Generation**: Automatic receipts
4. **Webhook Handlers**: Payment confirmations
5. **Refund Policy**: 30-day money-back guarantee

## Revenue Projections
- **Target**: 1000 users in Year 1
- **Conversion Rate**: 10% (100 premium users)
- **Annual Revenue**: $2,900
- **Growth**: 50% YoY

## Marketing Strategy
1. **Free tier**: Attract users with basic functionality
2. **Soft limits**: 3 donations covers testing but not real use
3. **Value props**: Tax savings calculator shows ROI
4. **Seasonal push**: Promote before tax season
5. **Referral program**: Free month for referrals