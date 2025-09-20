export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { email, password, name } = await request.json();

        // Validate input
        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email and password are required'
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

        // Create user
        const result = await env.DB.prepare(`
            INSERT INTO users (email, password, name, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(
            email.toLowerCase(),
            hashedPassword,
            name || email.split('@')[0]
        ).run();

        if (result.success) {
            return new Response(JSON.stringify({
                success: true,
                message: 'Account created successfully'
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