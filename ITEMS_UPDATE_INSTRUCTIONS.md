# Item Donation Database Update Instructions

## 🚨 CRITICAL: Database Update Required

### Step 1: Update D1 Database
Run the schema-items.sql file on your D1 database:

1. **Via Cloudflare Dashboard:**
   - Go to https://dash.cloudflare.com
   - Navigate to Workers & Pages → D1 → `charity-tracker-qwik-db`
   - Click "Console" tab
   - Copy contents of `schema-items.sql` and paste
   - Click Execute

2. **Via Command Line:**
```bash
cd /home/robpressman/workspace/Charity-Tracker-Qwik-Design/charity-tracker-qwik
npx wrangler d1 execute charity-tracker-qwik-db --file schema-items.sql
```

## 📝 What Was Added

### Database Tables:
1. **item_categories** - 12 categories (Clothing, Household, Electronics, etc.)
2. **donation_items** - 95+ items with quality-based pricing:
   - value_poor
   - value_fair
   - value_good
   - value_excellent

### API Endpoint:
- `/api/items` - New endpoint created
- `?type=categories` - Get all categories
- `?category_id=1` - Get items for specific category

## 🔧 Frontend Changes Needed

### Update Item Donation Form (in dashboard.html):

Replace the current itemFields div with:

```html
<div id="itemFields" class="donation-type-fields" style="display:none;">
    <div class="form-group">
        <label for="itemCategory">Category *</label>
        <select id="itemCategory" onchange="loadItemsForCategory()" required>
            <option value="">Select Category</option>
            <!-- Populated from database -->
        </select>
    </div>

    <div class="form-group" id="itemSelectGroup" style="display:none;">
        <label for="itemSelect">Item *</label>
        <select id="itemSelect" onchange="updateItemValue()" required>
            <option value="">Select Item</option>
            <!-- Populated based on category -->
        </select>
    </div>

    <div class="form-group" id="itemQualityGroup" style="display:none;">
        <label for="itemQuality">Condition *</label>
        <select id="itemQuality" onchange="updateItemValue()" required>
            <option value="fair">Fair - Some wear, fully functional</option>
            <option value="good" selected>Good - Minor wear, clean</option>
            <option value="excellent">Excellent - Like new</option>
        </select>
    </div>

    <div class="form-group" id="itemQuantityGroup" style="display:none;">
        <label for="itemQuantity">Quantity</label>
        <input type="number" id="itemQuantity" value="1" min="1" onchange="updateItemValue()">
    </div>

    <div class="form-group">
        <label>Selected Items</label>
        <div id="selectedItemsList" style="max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:8px;padding:0.5rem;background:#f9fafb;">
            <div class="empty-state" style="color:#9ca3af;text-align:center;">No items added</div>
        </div>
    </div>

    <div class="form-group">
        <button type="button" class="btn-primary" onclick="addItemToList()">Add Item</button>
    </div>

    <div class="form-group">
        <label for="estimatedValue">Total Value</label>
        <input type="number" id="estimatedValue" step="0.01" min="0" readonly style="background:#f9fafb;">
        <input type="hidden" id="itemDescription">
    </div>
</div>
```

### Add JavaScript Functions:

```javascript
let itemCategories = [];
let currentItems = [];
let selectedDonationItems = [];

// Load categories on page load
async function loadItemCategories() {
    try {
        const response = await fetch('/api/items?type=categories');
        const data = await response.json();

        if (data.success) {
            itemCategories = data.categories;
            const select = document.getElementById('itemCategory');
            select.innerHTML = '<option value="">Select Category</option>';

            itemCategories.forEach(cat => {
                select.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Load items for selected category
async function loadItemsForCategory() {
    const categoryId = document.getElementById('itemCategory').value;

    if (!categoryId) {
        document.getElementById('itemSelectGroup').style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/api/items?category_id=${categoryId}`);
        const data = await response.json();

        if (data.success) {
            currentItems = data.items;
            const select = document.getElementById('itemSelect');
            select.innerHTML = '<option value="">Select Item</option>';

            currentItems.forEach(item => {
                select.innerHTML += `<option value="${item.id}">${item.name} - ${item.description}</option>`;
            });

            document.getElementById('itemSelectGroup').style.display = 'block';
        }
    } catch (error) {
        console.error('Failed to load items:', error);
    }
}

// Update value based on selected item and quality
function updateItemValue() {
    const itemId = document.getElementById('itemSelect').value;
    const quality = document.getElementById('itemQuality').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;

    if (!itemId) {
        document.getElementById('itemQualityGroup').style.display = 'none';
        document.getElementById('itemQuantityGroup').style.display = 'none';
        return;
    }

    const item = currentItems.find(i => i.id == itemId);
    if (!item) return;

    document.getElementById('itemQualityGroup').style.display = 'block';
    document.getElementById('itemQuantityGroup').style.display = 'block';

    const valueKey = `value_${quality}`;
    const unitValue = item[valueKey] || item.value_good;
    const totalValue = unitValue * quantity;

    // Update preview
    document.getElementById('estimatedValue').value = totalValue.toFixed(2);
}

// Add item to list
function addItemToList() {
    const categoryId = document.getElementById('itemCategory').value;
    const itemId = document.getElementById('itemSelect').value;
    const quality = document.getElementById('itemQuality').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;

    if (!categoryId || !itemId) {
        alert('Please select category and item');
        return;
    }

    const category = itemCategories.find(c => c.id == categoryId);
    const item = currentItems.find(i => i.id == itemId);
    const valueKey = `value_${quality}`;
    const unitValue = item[valueKey] || item.value_good;

    selectedDonationItems.push({
        categoryName: category.name,
        itemName: item.name,
        quality: quality,
        quantity: quantity,
        unitValue: unitValue,
        totalValue: unitValue * quantity
    });

    updateSelectedItemsDisplay();

    // Reset form
    document.getElementById('itemSelect').value = '';
    document.getElementById('itemQuality').value = 'good';
    document.getElementById('itemQuantity').value = '1';
    document.getElementById('itemQualityGroup').style.display = 'none';
    document.getElementById('itemQuantityGroup').style.display = 'none';
}

function updateSelectedItemsDisplay() {
    const container = document.getElementById('selectedItemsList');

    if (selectedDonationItems.length === 0) {
        container.innerHTML = '<div class="empty-state" style="color:#9ca3af;text-align:center;">No items added</div>';
        document.getElementById('estimatedValue').value = '0.00';
        return;
    }

    let html = '';
    let totalValue = 0;

    selectedDonationItems.forEach((item, index) => {
        html += `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem;border-bottom:1px solid #e5e7eb;">
                <div>
                    <strong>${item.itemName}</strong> (${item.quality})
                    <br><small>${item.categoryName} • Qty: ${item.quantity}</small>
                </div>
                <div>
                    <span style="color:#667eea;font-weight:600;">$${item.totalValue.toFixed(2)}</span>
                    <button type="button" onclick="removeItemFromList(${index})" style="margin-left:0.5rem;color:#ef4444;cursor:pointer;">×</button>
                </div>
            </div>
        `;
        totalValue += item.totalValue;
    });

    container.innerHTML = html;
    document.getElementById('estimatedValue').value = totalValue.toFixed(2);

    // Update item description for database
    const descriptions = selectedDonationItems.map(i =>
        `${i.itemName} (${i.quality}, qty: ${i.quantity})`
    ).join('; ');
    document.getElementById('itemDescription').value = descriptions;
}

function removeItemFromList(index) {
    selectedDonationItems.splice(index, 1);
    updateSelectedItemsDisplay();
}

// Call on page load
loadItemCategories();
```

## 🎯 Summary

This update provides:
1. **Database-driven categories** - 12 categories stored in DB
2. **95+ predefined items** with IRS-based values
3. **Quality-based pricing** - Fair, Good, Excellent conditions
4. **Proper item selection flow**:
   - Select Category → Select Item → Select Quality → Add to list
5. **Multiple items per donation** with running total
6. **API endpoint** to fetch categories and items

## 📊 Item Value Examples

| Item | Poor | Fair | Good | Excellent |
|------|------|------|------|-----------|
| Women's Dress | $4 | $8 | $15 | $25 |
| Men's Suit | $15 | $30 | $60 | $120 |
| Laptop | $75 | $150 | $300 | $600 |
| Sofa | $35 | $85 | $200 | $500 |
| Children's Book | $0.50 | $1 | $2 | $3 |

Values based on IRS Publication 561 and Goodwill Valuation Guide.