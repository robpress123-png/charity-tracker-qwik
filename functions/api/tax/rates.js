// API endpoint for tax rate calculations
// GET /api/tax/rates

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);

    try {
        const token = request.headers.get('Authorization');
        if (!token) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        // Get query parameters
        const year = parseInt(url.searchParams.get('year')) || new Date().getFullYear();
        const filingStatus = url.searchParams.get('filing_status') || 'single';
        const income = parseFloat(url.searchParams.get('income')) || null;
        const userId = url.searchParams.get('user_id');

        const response = {
            success: true,
            year,
            filing_status: filingStatus
        };

        // If user_id provided, check for saved settings
        if (userId) {
            const userSettings = await env.DB.prepare(`
                SELECT filing_status, tax_bracket, agi_range
                FROM user_tax_settings
                WHERE user_id = ? AND tax_year = ?
            `).bind(userId, year).first();

            if (userSettings) {
                // Override filing status with user's saved setting
                if (userSettings.filing_status) {
                    response.filing_status = userSettings.filing_status;
                }
                if (userSettings.tax_bracket) {
                    response.tax_bracket = userSettings.tax_bracket;
                }
                response.agi_range = userSettings.agi_range;
                response.source = 'user_settings';
            }
        }

        // Get tax brackets for this year and filing status
        // Use the filing status from query parameter, NOT the saved one
        // This allows users to explore different filing statuses
        const effectiveFilingStatus = filingStatus; // Use query param, not saved
        const brackets = await env.DB.prepare(`
            SELECT min_income, max_income, rate
            FROM tax_brackets
            WHERE tax_year = ? AND filing_status = ?
            ORDER BY min_income ASC
        `).bind(year, effectiveFilingStatus).all();

        response.brackets = brackets.results || [];

        // If income provided, calculate marginal rate
        if (income && brackets.results) {
            for (const bracket of brackets.results) {
                if (income >= bracket.min_income &&
                    (bracket.max_income === null || income < bracket.max_income)) {
                    response.marginal_rate = bracket.rate;
                    response.bracket_range = {
                        min: bracket.min_income,
                        max: bracket.max_income
                    };
                    break;
                }
            }
        }

        // Get standard deduction
        const deduction = await env.DB.prepare(`
            SELECT amount
            FROM standard_deductions
            WHERE tax_year = ? AND filing_status = ?
        `).bind(year, filingStatus).first();

        if (deduction) {
            response.standard_deduction = deduction.amount;
        }

        // Get contribution limits (for 2026 OBBBA rules)
        const limits = await env.DB.prepare(`
            SELECT rule_type, value, description
            FROM contribution_limits
            WHERE tax_year = ?
            AND (filing_status = ? OR filing_status IS NULL)
        `).bind(year, filingStatus).all();

        if (limits.results && limits.results.length > 0) {
            response.contribution_rules = {};
            for (const limit of limits.results) {
                response.contribution_rules[limit.rule_type] = {
                    value: limit.value,
                    description: limit.description
                };
            }
        }

        // Get capital gains rates
        const capitalGains = await env.DB.prepare(`
            SELECT min_income, max_income, rate
            FROM capital_gains_rates
            WHERE tax_year = ? AND filing_status = ? AND gain_type = 'long_term'
            ORDER BY min_income ASC
        `).bind(year, filingStatus).all();

        response.capital_gains_rates = capitalGains.results || [];

        return Response.json(response);

    } catch (error) {
        console.error('Error fetching tax rates:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch tax rates: ' + error.message
        }, { status: 500 });
    }
}

// POST /api/tax/rates - Save user's tax settings
export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const token = request.headers.get('Authorization');
        if (!token) {
            return Response.json({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const data = await request.json();
        const { user_id, tax_year, filing_status, tax_bracket, agi_range } = data;

        if (!user_id || !tax_year) {
            return Response.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Insert or update user settings
        await env.DB.prepare(`
            INSERT OR REPLACE INTO user_tax_settings
            (user_id, tax_year, filing_status, tax_bracket, agi_range, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            user_id,
            tax_year,
            filing_status,
            tax_bracket,
            agi_range
        ).run();

        return Response.json({
            success: true,
            message: 'Tax settings saved successfully'
        });

    } catch (error) {
        console.error('Error saving tax settings:', error);
        return Response.json({
            success: false,
            error: 'Failed to save tax settings: ' + error.message
        }, { status: 500 });
    }
}