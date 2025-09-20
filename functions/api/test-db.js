export async function onRequestGet(context) {
    const { env, data } = context;

    // Try different possible database bindings
    const possibleDB = env.DB ||
                      env.DATABASE ||
                      env['charity-tracker-qwik-db'] ||
                      env['charity_tracker_qwik_db'] ||
                      data?.DB ||
                      context.DB ||
                      context.env?.DB;

    // Debug information
    const debug = {
        hasDB: !!possibleDB,
        envKeys: Object.keys(env),
        envType: typeof env,
        contextKeys: Object.keys(context),
        dataKeys: data ? Object.keys(data) : null,
        dataType: typeof data,
        cfPagesUrl: env.CF_PAGES_URL,
        cfPagesBranch: env.CF_PAGES_BRANCH,
        environment: env.ENVIRONMENT
    };

    // Try to access the database
    let dbTest = null;
    if (possibleDB) {
        try {
            const result = await possibleDB.prepare('SELECT 1 as test').first();
            dbTest = result;
        } catch (e) {
            dbTest = { error: e.message };
        }
    }

    // Check if we're actually getting data from the database in production
    let productionCheck = null;
    try {
        // Try to make a simple fetch to see if other APIs work
        const testFetch = await fetch(env.CF_PAGES_URL + '/api/charities?limit=1');
        const testData = await testFetch.json();
        productionCheck = {
            charitiesWork: testData.success,
            isMockData: testData.message?.includes('mock')
        };
    } catch (e) {
        productionCheck = { error: e.message };
    }

    return new Response(JSON.stringify({
        success: !!possibleDB,
        debug,
        dbTest,
        productionCheck,
        message: possibleDB ? 'Database might be available' : 'Database not found - app likely using mock data',
        recommendation: 'Check Cloudflare dashboard: Pages > Settings > Functions > D1 database bindings'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}