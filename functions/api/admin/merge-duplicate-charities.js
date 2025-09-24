/**
 * Admin function to merge duplicate personal charities
 * POST /api/admin/merge-duplicate-charities
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Admin authentication check would go here
        // For now, we'll require a special admin token in the header
        const adminToken = request.headers.get('X-Admin-Token');
        if (adminToken !== 'admin-secret-2024') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Unauthorized'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { userId, dryRun = false } = body;

        if (!env.DB) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Database not available'
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const results = {
            duplicatesFound: [],
            mergedCharities: [],
            donationsUpdated: 0,
            charitiesDeleted: 0,
            errors: []
        };

        // Find duplicate personal charities for the user (or all users if not specified)
        let duplicatesQuery;
        if (userId) {
            duplicatesQuery = env.DB.prepare(`
                SELECT
                    user_id,
                    LOWER(name) as charity_name,
                    COUNT(*) as duplicate_count,
                    GROUP_CONCAT(id) as charity_ids,
                    GROUP_CONCAT(name) as original_names,
                    MIN(created_at) as earliest_created
                FROM user_charities
                WHERE user_id = ?
                GROUP BY user_id, LOWER(name)
                HAVING COUNT(*) > 1
            `).bind(userId);
        } else {
            duplicatesQuery = env.DB.prepare(`
                SELECT
                    user_id,
                    LOWER(name) as charity_name,
                    COUNT(*) as duplicate_count,
                    GROUP_CONCAT(id) as charity_ids,
                    GROUP_CONCAT(name) as original_names,
                    MIN(created_at) as earliest_created
                FROM user_charities
                GROUP BY user_id, LOWER(name)
                HAVING COUNT(*) > 1
            `);
        }

        const duplicates = await duplicatesQuery.all();

        if (!duplicates.results || duplicates.results.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No duplicate personal charities found',
                results
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        results.duplicatesFound = duplicates.results;

        // Process each set of duplicates
        for (const duplicate of duplicates.results) {
            const charityIds = duplicate.charity_ids.split(',');
            const originalNames = duplicate.original_names.split(',');

            // Keep the first charity (oldest) and merge others into it
            const keepCharityId = charityIds[0];
            const mergeCharityIds = charityIds.slice(1);

            console.log(`[MERGE] Processing duplicate: ${duplicate.charity_name}`);
            console.log(`[MERGE] Keeping charity ID: ${keepCharityId} (${originalNames[0]})`);
            console.log(`[MERGE] Merging charity IDs: ${mergeCharityIds.join(', ')}`);

            if (!dryRun) {
                try {
                    // Update all donations to point to the kept charity
                    for (const mergeId of mergeCharityIds) {
                        const updateResult = await env.DB.prepare(`
                            UPDATE donations
                            SET user_charity_id = ?
                            WHERE user_charity_id = ?
                        `).bind(keepCharityId, mergeId).run();

                        results.donationsUpdated += updateResult.meta.changes;
                        console.log(`[MERGE] Updated ${updateResult.meta.changes} donations from charity ${mergeId} to ${keepCharityId}`);
                    }

                    // Delete the duplicate personal charities
                    for (const mergeId of mergeCharityIds) {
                        await env.DB.prepare(`
                            DELETE FROM user_charities
                            WHERE id = ?
                        `).bind(mergeId).run();

                        results.charitiesDeleted++;
                        console.log(`[MERGE] Deleted duplicate charity: ${mergeId}`);
                    }

                    results.mergedCharities.push({
                        user_id: duplicate.user_id,
                        charity_name: originalNames[0],
                        kept_id: keepCharityId,
                        merged_ids: mergeCharityIds,
                        donations_updated: results.donationsUpdated
                    });

                } catch (mergeError) {
                    console.error(`[MERGE] Error processing duplicate ${duplicate.charity_name}:`, mergeError);
                    results.errors.push({
                        charity_name: duplicate.charity_name,
                        error: mergeError.message
                    });
                }
            } else {
                // Dry run - just report what would be done
                results.mergedCharities.push({
                    user_id: duplicate.user_id,
                    charity_name: originalNames[0],
                    would_keep_id: keepCharityId,
                    would_merge_ids: mergeCharityIds,
                    duplicate_count: duplicate.duplicate_count
                });
            }
        }

        const message = dryRun
            ? `Dry run complete: Found ${results.duplicatesFound.length} sets of duplicate charities`
            : `Merge complete: Merged ${results.mergedCharities.length} sets of duplicate charities, updated ${results.donationsUpdated} donations, deleted ${results.charitiesDeleted} duplicate records`;

        return new Response(JSON.stringify({
            success: true,
            message,
            results
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Merge duplicate charities error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to merge duplicate charities: ' + error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// CORS preflight handler
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Access-Control-Max-Age': '86400'
        }
    });
}