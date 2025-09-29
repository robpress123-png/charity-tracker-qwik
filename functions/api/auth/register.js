export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const {
            email,
            password,
            name,
            // Optional profile fields
            address,
            city,
            state,
            zip,
            filingStatus,
            taxBracket,
            profileCompleted
        } = await request.json();

        // Validate required fields
        if (!email || !password || !name) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email, password, and name are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email format'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate password length
        if (password.length < 8) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Password must be at least 8 characters'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (existingUser) {
            return new Response(JSON.stringify({
                success: false,
                error: 'An account with this email already exists'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hash password (using a simple hash for demo - in production use bcrypt or similar)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create user with optional profile data
        const result = await env.DB.prepare(`
            INSERT INTO users (
                email, password, name,
                address, city, state, zip_code,
                filing_status, tax_bracket,
                plan, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', datetime('now'))
        `).bind(
            email.toLowerCase(),
            hashedPassword,
            name,
            address || null,
            city || null,
            state || null,
            zip || null,
            filingStatus || null,
            taxBracket || null
        ).run();

        if (result.success) {
            // Generate auth token for automatic login
            const userId = result.meta.last_row_id;
            const token = `token-${userId}-${Date.now()}`;

            // If tax settings were provided, also create user_tax_settings entry
            if (filingStatus && taxBracket) {
                const currentYear = new Date().getFullYear();
                await env.DB.prepare(`
                    INSERT OR REPLACE INTO user_tax_settings (
                        user_id, tax_year, filing_status, tax_bracket,
                        created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                `).bind(
                    userId.toString(),
                    currentYear,
                    filingStatus,
                    taxBracket
                ).run();
            }

            return new Response(JSON.stringify({
                success: true,
                message: profileCompleted ?
                    'Registration complete with profile!' :
                    'Account created successfully!',
                token: token,
                userId: userId.toString(),
                profileCompleted: profileCompleted || false
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error('Failed to create user');
        }

    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Registration failed. Please try again.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}