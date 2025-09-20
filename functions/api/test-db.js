export async function onRequestGet(context) {
    const { env } = context;

    // Debug information
    const debug = {
        hasDB: !!env.DB,
        envKeys: Object.keys(env),
        envType: typeof env,
        contextKeys: Object.keys(context)
    };

    // Try to access the database
    let dbTest = null;
    if (env.DB) {
        try {
            const result = await env.DB.prepare('SELECT 1 as test').first();
            dbTest = result;
        } catch (e) {
            dbTest = { error: e.message };
        }
    }

    return new Response(JSON.stringify({
        success: !!env.DB,
        debug,
        dbTest,
        message: env.DB ? 'Database is connected' : 'Database not found in environment'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}