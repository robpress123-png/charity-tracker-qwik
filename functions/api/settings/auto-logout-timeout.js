export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Get the timeout setting from database
        const result = await env.DB.prepare(
            "SELECT value FROM settings WHERE key = 'auto_logout_timeout'"
        ).first();

        if (result) {
            return new Response(JSON.stringify({
                success: true,
                timeout: parseInt(result.value)
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Return default if not found
        return new Response(JSON.stringify({
            success: true,
            timeout: 1800000 // 30 minutes default
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching auto-logout timeout:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;

    // Check for admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.includes('admin')) {
        return new Response(JSON.stringify({
            success: false,
            error: 'Admin access required'
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { timeout } = await request.json();

        if (!timeout || isNaN(timeout) || timeout < 60000) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid timeout value (minimum 1 minute)'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the timeout setting
        await env.DB.prepare(
            `INSERT OR REPLACE INTO settings (key, value, description, updated_at)
             VALUES ('auto_logout_timeout', ?, 'Auto-logout timeout in milliseconds', datetime('now'))`
        ).bind(timeout.toString()).run();

        return new Response(JSON.stringify({
            success: true,
            timeout: timeout
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error updating auto-logout timeout:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}