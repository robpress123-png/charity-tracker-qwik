// Simple receipt storage without R2
// Stores small images as base64 in database, larger files as URLs only

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const donationId = formData.get('donationId');
        const file = formData.get('file');
        const url = formData.get('url');
        const notes = formData.get('notes');

        // Get user from token
        const token = request.headers.get('Authorization');
        if (!token || !token.startsWith('Bearer ')) {
            return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = '1'; // Simplified for demo

        let receiptData = { notes };

        if (file && file.size > 0) {
            // Check file size (limit to 500KB for base64 storage)
            if (file.size > 500 * 1024) {
                return Response.json({
                    success: false,
                    error: 'File too large. Please use an external URL for files over 500KB.'
                }, { status: 400 });
            }

            // Convert to base64
            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;

            receiptData.receipt_data = dataUrl;
            receiptData.receipt_type = 'embedded';
            receiptData.file_name = file.name;
            receiptData.file_size = file.size;
        } else if (url) {
            receiptData.receipt_url = url;
            receiptData.receipt_type = 'url';
        }

        // Update donation with receipt info
        const result = await env.DB.prepare(`
            UPDATE donations
            SET notes = json_patch(
                COALESCE(notes, '{}'),
                json_object(
                    'receipt', json(?),
                    'receipt_updated', datetime('now')
                )
            )
            WHERE id = ? AND user_id = ?
        `).bind(
            JSON.stringify(receiptData),
            donationId,
            userId
        ).run();

        return Response.json({
            success: true,
            message: 'Receipt saved successfully'
        });

    } catch (error) {
        console.error('Error saving receipt:', error);
        return Response.json({
            success: false,
            error: 'Failed to save receipt'
        }, { status: 500 });
    }
}