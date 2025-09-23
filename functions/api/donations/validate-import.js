/**
 * Cloudflare Pages Function for validating import data and finding charity matches
 * POST /api/donations/validate-import
 * Returns potential charity matches for user confirmation before actual import
 */

import { charityAliases, findCharityWithAliases } from '../../utils/charity-aliases.js';

// Helper function to get user from token
function getUserFromToken(token) {
    if (!token || !token.startsWith('Bearer ')) {
        return null;
    }

    const tokenValue = token.replace('Bearer ', '');

    // For demo/test mode
    if (tokenValue === 'test-token' || tokenValue === 'demo-token') {
        return { id: '1', email: 'test@example.com' };
    }

    // Parse real token format: token-{userId}-{timestamp}
    if (tokenValue.startsWith('token-')) {
        const parts = tokenValue.split('-');
        if (parts.length >= 3) {
            return { id: parts[1], email: parts[2] || 'user@example.com' };
        }
    }

    return null;
}

/**
 * Find potential charity matches with confidence scores
 */
function findPotentialMatches(searchName, charityMap, maxResults = 5) {
    const matches = [];
    const cleanSearchName = searchName.toLowerCase().trim();

    // Remove common suffixes for better matching
    const cleanedForMatch = cleanSearchName
        .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org|corp|corporation)\b/gi, '')
        .replace(/[^\w\s]/g, '')
        .trim();

    // 1. Exact match (100% confidence)
    const exactMatch = charityMap.get(cleanSearchName);
    if (exactMatch) {
        matches.push({
            charity: exactMatch,
            confidence: 100,
            matchType: 'exact'
        });
    }

    // 2. Check aliases (90% confidence)
    const aliasMatch = findCharityWithAliases(searchName, charityMap);
    if (aliasMatch && (!exactMatch || aliasMatch.id !== exactMatch.id)) {
        matches.push({
            charity: aliasMatch,
            confidence: 90,
            matchType: 'alias'
        });
    }

    // 3. Case-insensitive exact match (85% confidence)
    for (const [key, charity] of charityMap) {
        if (key === cleanSearchName && !matches.find(m => m.charity.id === charity.id)) {
            matches.push({
                charity,
                confidence: 85,
                matchType: 'case_insensitive'
            });
        }
    }

    // 4. Clean name match (80% confidence)
    for (const [key, charity] of charityMap) {
        const cleanKey = key
            .replace(/\b(inc|incorporated|llc|ltd|foundation|fund|charity|organization|org|corp|corporation)\b/gi, '')
            .replace(/[^\w\s]/g, '')
            .trim();

        if (cleanKey === cleanedForMatch && !matches.find(m => m.charity.id === charity.id)) {
            matches.push({
                charity,
                confidence: 80,
                matchType: 'cleaned'
            });
        }
    }

    // 5. Starts with match (70% confidence)
    for (const [key, charity] of charityMap) {
        if ((key.startsWith(cleanedForMatch) || cleanedForMatch.startsWith(key))
            && !matches.find(m => m.charity.id === charity.id)) {
            matches.push({
                charity,
                confidence: 70,
                matchType: 'starts_with'
            });
        }
    }

    // 6. Contains match (60% confidence)
    for (const [key, charity] of charityMap) {
        if ((key.includes(cleanedForMatch) || cleanedForMatch.includes(key))
            && !matches.find(m => m.charity.id === charity.id)) {
            matches.push({
                charity,
                confidence: 60,
                matchType: 'contains'
            });
        }
    }

    // 7. Word overlap (50% confidence)
    const searchWords = cleanedForMatch.split(/\s+/).filter(w => w.length > 2);
    if (searchWords.length > 0) {
        for (const [key, charity] of charityMap) {
            const keyWords = key.split(/\s+/).filter(w => w.length > 2);
            const commonWords = searchWords.filter(w => keyWords.includes(w));

            if (commonWords.length >= 2 && !matches.find(m => m.charity.id === charity.id)) {
                const confidence = Math.min(50, 30 + (commonWords.length * 10));
                matches.push({
                    charity,
                    confidence,
                    matchType: 'word_overlap'
                });
            }
        }
    }

    // Sort by confidence and return top matches
    return matches
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, maxResults);
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Check authentication
        const token = request.headers.get('Authorization');
        const user = getUserFromToken(token);

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Authentication required'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const body = await request.json();
        const { donations } = body;

        if (!donations || !Array.isArray(donations)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid request: donations array required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Get all charities for matching
        let allCharities = { results: [] };
        try {
            // Get system charities
            const systemCharities = await env.DB.prepare(`
                SELECT id, name, ein, 'system' as type FROM charities LIMIT 2000
            `).all();

            // Get user charities
            const userCharities = await env.DB.prepare(`
                SELECT id, name, ein, 'personal' as type FROM user_charities WHERE user_id = ?
            `).bind(user.id).all();

            allCharities.results = [
                ...(systemCharities.results || []),
                ...(userCharities.results || [])
            ];
        } catch (error) {
            console.error('Failed to load charities:', error);
        }

        // Create charity lookup map
        const charityMap = new Map();
        allCharities.results.forEach(charity => {
            charityMap.set(charity.name.toLowerCase(), charity);
        });

        // Validate donations and find charity matches
        const validationResults = {
            totalRows: donations.length,
            validRows: 0,
            rowsNeedingConfirmation: 0,
            invalidRows: 0,
            charityMatches: {},
            errors: [],
            warnings: []
        };

        for (let i = 0; i < donations.length; i++) {
            const donation = donations[i];
            const rowNum = i + 1;

            // Validate required fields
            if (!donation.charity_name && !donation.charity_id) {
                validationResults.errors.push({
                    row: rowNum,
                    error: 'No charity specified'
                });
                validationResults.invalidRows++;
                continue;
            }

            if (!donation.amount || parseFloat(donation.amount) <= 0) {
                validationResults.errors.push({
                    row: rowNum,
                    error: 'Invalid amount'
                });
                validationResults.invalidRows++;
                continue;
            }

            // Find charity matches
            if (donation.charity_name && !donation.charity_id) {
                const potentialMatches = findPotentialMatches(donation.charity_name, charityMap);

                if (potentialMatches.length === 0) {
                    // No matches found - will need to create as personal charity
                    validationResults.charityMatches[rowNum] = {
                        searchName: donation.charity_name,
                        matches: [],
                        suggestPersonalCharity: true,
                        needsConfirmation: true
                    };
                    validationResults.rowsNeedingConfirmation++;
                } else if (potentialMatches.length === 1 && potentialMatches[0].confidence >= 90) {
                    // High confidence single match - auto-select but allow override
                    validationResults.charityMatches[rowNum] = {
                        searchName: donation.charity_name,
                        matches: potentialMatches,
                        autoSelected: potentialMatches[0].charity.id,
                        needsConfirmation: false
                    };
                    validationResults.validRows++;
                } else {
                    // Multiple matches or low confidence - needs user confirmation
                    validationResults.charityMatches[rowNum] = {
                        searchName: donation.charity_name,
                        matches: potentialMatches,
                        needsConfirmation: true
                    };
                    validationResults.rowsNeedingConfirmation++;
                }
            } else {
                validationResults.validRows++;
            }

            // Check for warnings
            if (donation.donation_type === 'items' && !donation.items) {
                validationResults.warnings.push({
                    row: rowNum,
                    warning: 'Items donation without itemized list - will create generic items'
                });
            }

            const donationDate = donation.donation_date || donation.date;
            if (donationDate && new Date(donationDate) > new Date()) {
                validationResults.warnings.push({
                    row: rowNum,
                    warning: 'Future date detected'
                });
            }
        }

        // Calculate summary
        validationResults.canAutoImport =
            validationResults.invalidRows === 0 &&
            validationResults.rowsNeedingConfirmation === 0;

        validationResults.requiresUserAction =
            validationResults.rowsNeedingConfirmation > 0;

        return new Response(JSON.stringify({
            success: true,
            validation: validationResults,
            summary: {
                total: donations.length,
                readyToImport: validationResults.validRows,
                needsReview: validationResults.rowsNeedingConfirmation,
                hasErrors: validationResults.invalidRows,
                canProceed: validationResults.invalidRows === 0
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        });

    } catch (error) {
        console.error('Validation error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to validate import data'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}