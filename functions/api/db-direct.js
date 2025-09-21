// Direct D1 access using REST API as a workaround
export async function onRequestPost(context) {
    const { request } = context;

    try {
        const { query, params } = await request.json();

        // Use Cloudflare's D1 REST API directly
        // This is a workaround when bindings don't work
        const accountId = 'YOUR_ACCOUNT_ID'; // You'll need to get this from Cloudflare
        const databaseId = '4b7b5031-1844-4ed9-aac0-fcb0e4bf0b3d';

        // Note: This would require API token authentication
        // For now, return instructions

        return new Response(JSON.stringify({
            success: false,
            message: 'D1 binding not working via wrangler.toml',
            solution: 'You need to manually add the binding in Cloudflare dashboard',
            steps: [
                '1. Delete the Pages project in Cloudflare',
                '2. Recreate it with Git integration',
                '3. The wrangler.toml should be read correctly',
                'OR',
                '1. Clone the repo to a machine with Node 20+',
                '2. Run: npx wrangler pages deploy dist/ --compatibility-date=2025-01-01',
                '3. This will create proper bindings'
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}