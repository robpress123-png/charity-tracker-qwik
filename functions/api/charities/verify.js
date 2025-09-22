/**
 * Cloudflare Pages Function for verifying charity legitimacy
 * GET /api/charities/verify?ein=XX-XXXXXXX - Verify a charity by EIN
 * GET /api/charities/verify?name=CharityName - Verify a charity by name
 */

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    const ein = url.searchParams.get('ein');
    const name = url.searchParams.get('name');

    if (!ein && !name) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Please provide either an EIN or charity name'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        // Check if D1 database is available
        if (!env.DB) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not available'
            }), {
                status: 503,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        let charity = null;
        let verificationStatus = {
            isVerified: false,
            source: null,
            message: '',
            charity: null,
            suggestions: []
        };

        if (ein) {
            // Clean EIN format (remove dashes and spaces)
            const cleanEIN = ein.replace(/[^0-9]/g, '').padStart(9, '0');

            // Search in our verified charities database
            charity = await env.DB.prepare(
                'SELECT * FROM charities WHERE ein = ? LIMIT 1'
            ).bind(cleanEIN).first();

            if (charity) {
                verificationStatus = {
                    isVerified: true,
                    source: 'IRS Publication 78',
                    message: 'This charity is verified as a tax-exempt 501(c)(3) organization.',
                    charity: {
                        id: charity.id,
                        name: charity.name,
                        ein: charity.ein,
                        category: charity.category,
                        address: charity.address,
                        city: charity.city,
                        state: charity.state,
                        zip_code: charity.zip_code,
                        website: charity.website,
                        description: charity.description
                    },
                    suggestions: []
                };
            } else {
                verificationStatus.message = 'This EIN is not found in our database of IRS-verified charities. It may be a new organization or not yet registered.';
            }
        } else if (name) {
            // Search by name (case-insensitive, partial match)
            const searchName = name.toLowerCase();

            // First try exact match
            charity = await env.DB.prepare(
                'SELECT * FROM charities WHERE LOWER(name) = ? LIMIT 1'
            ).bind(searchName).first();

            if (charity) {
                verificationStatus = {
                    isVerified: true,
                    source: 'IRS Publication 78',
                    message: 'This charity is verified as a tax-exempt 501(c)(3) organization.',
                    charity: {
                        id: charity.id,
                        name: charity.name,
                        ein: charity.ein,
                        category: charity.category,
                        address: charity.address,
                        city: charity.city,
                        state: charity.state,
                        zip_code: charity.zip_code,
                        website: charity.website,
                        description: charity.description
                    },
                    suggestions: []
                };
            } else {
                // Try partial match and get suggestions
                const suggestions = await env.DB.prepare(
                    `SELECT id, name, ein, category, city, state
                     FROM charities
                     WHERE LOWER(name) LIKE ?
                     LIMIT 10`
                ).bind(`%${searchName}%`).all();

                if (suggestions.results && suggestions.results.length > 0) {
                    verificationStatus = {
                        isVerified: false,
                        source: 'IRS Publication 78',
                        message: `No exact match found for "${name}". Did you mean one of these verified charities?`,
                        charity: null,
                        suggestions: suggestions.results.map(s => ({
                            id: s.id,
                            name: s.name,
                            ein: s.ein,
                            category: s.category,
                            location: `${s.city}, ${s.state}`
                        }))
                    };
                } else {
                    verificationStatus.message = `No charity matching "${name}" found in our database of IRS-verified charities.`;
                }
            }
        }

        // Add verification tips
        verificationStatus.tips = [
            'Always verify the EIN with the organization directly',
            'Check if donations are tax-deductible',
            'Look for transparency in financial reporting',
            'Verify the charity\'s mission aligns with your values'
        ];

        // Add warning signs of potential scams
        verificationStatus.warningSignsToAvoid = [
            'High-pressure tactics to donate immediately',
            'Requests for cash-only donations',
            'Vague descriptions of how funds are used',
            'Names similar to well-known charities'
        ];

        return new Response(JSON.stringify({
            success: true,
            verification: verificationStatus
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Charity verification error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to verify charity: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}