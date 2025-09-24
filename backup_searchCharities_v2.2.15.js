// BACKUP of charity search functions from v2.2.15
// Created: 2025-01-24
// This file contains the original search implementation before smart search was added

function searchCharities_BACKUP(query) {
    if (!query || query.length < 2) {
        document.getElementById('charityDropdown').classList.remove('show');
        return;
    }

    console.log('Charity search for:', query);

    const currentCharityId = document.getElementById('selectedCharityId').value;
    const currentCharityName = document.getElementById('donationCharity').value;

    if (currentCharityId && window.lastSelectedCharityName && currentCharityName !== window.lastSelectedCharityName) {
        document.getElementById('selectedCharityId').value = '';
        window.lastSelectedCharityName = null;
    } else if (!currentCharityId) {
        document.getElementById('selectedCharityId').value = '';
    }

    clearTimeout(searchTimeout);
    selectedCharityIndex = -1;

    searchTimeout = setTimeout(async () => {
        // Search local cache first
        let results = allCharities.filter(charity =>
            charity.name.toLowerCase().includes(query) ||
            (charity.ein && charity.ein.toLowerCase().includes(query))
        ).slice(0, 10);

        // Always search the full database to ensure we find all matches
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/charities?search=${encodeURIComponent(query)}&limit=100`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success && data.charities) {
                // Merge results, avoiding duplicates and prioritizing local results
                const existingIds = new Set(results.map(r => r.id));
                const newResults = data.charities.filter(c => !existingIds.has(c.id));
                // Keep local results first (they're ranked higher), then add API results
                results = [...results, ...newResults].slice(0, 100);
                console.log(`Found ${results.length} total charities matching "${query}"`);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }

        displayCharityResults(results, query);
    }, 300);
}

function displayCharityResults_BACKUP(results, query) {
    const dropdown = document.getElementById('charityDropdown');

    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="autocomplete-add-new" onclick="showAddCharityFromSearch('${query}')">
                + Add new charity "${query}"
            </div>
        `;
    } else {
        let html = '';
        results.forEach((charity, index) => {
            const personalBadge = charity.source === 'personal'
                ? '<span style="background: #fbbf24; color: #92400e; font-size: 0.7rem; padding: 0.125rem 0.375rem; border-radius: 4px; margin-left: 0.5rem; font-weight: 500;">Personal</span>'
                : '';
            html += `
                <div class="autocomplete-item ${index === selectedCharityIndex ? 'selected' : ''}"
                     data-id="${charity.id}"
                     data-index="${index}"
                     data-source="${charity.source || 'system'}"
                     onclick="selectCharity('${charity.id}', '${charity.name.replace(/'/g, "\\'")}', '${charity.source || 'system'}')">
                    <div class="autocomplete-item-name">${charity.name}${personalBadge}</div>
                    ${charity.ein ? `<span class="autocomplete-item-ein">EIN: ${charity.ein}</span>` : ''}
                    ${charity.category ? `<span class="autocomplete-item-category">${charity.category}</span>` : ''}
                </div>
            `;
        });

        // If we have many results, we likely hit the limit - show indicator
        if (results.length >= 100) {
            html += `
                <div style="padding: 8px 12px; color: #6b7280; font-size: 0.875rem; text-align: center; border-top: 1px solid #e5e7eb;">
                    Showing first 100 results - keep typing to refine search
                </div>
            `;
        }

        // Add "Add new charity" option at the end
        html += `
            <div class="autocomplete-add-new" onclick="showAddCharityFromSearch('${query}')">
                + Add new charity
            </div>
        `;

        dropdown.innerHTML = html;
    }

    dropdown.classList.add('show');
    dropdown.style.display = 'block';
}