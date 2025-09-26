export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email and password are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Hash the password with SHA-256 (same as regular login)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Check if user exists and has admin role
        const user = await env.DB.prepare(
            'SELECT id, email, username, role FROM users WHERE email = ? AND password = ? AND role = ?'
        ).bind(email, passwordHash, 'admin').first();

        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid credentials or insufficient privileges'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate admin token (could be more sophisticated in production)
        const adminToken = `admin-${user.id}-${Date.now()}`;

        return new Response(JSON.stringify({
            success: true,
            adminToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin auth error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Authentication failed'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}