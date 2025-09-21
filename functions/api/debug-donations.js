/**
 * Debug endpoint to check raw donation data
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (!env.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not available'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Get last 5 donations with raw notes field
    const stmt = env.DB.prepare(`
      SELECT id, charity_id, amount, date, notes, user_id
      FROM donations
      ORDER BY date DESC
      LIMIT 5
    `);

    const result = await stmt.all();

    // Parse each donation to show both raw and parsed data
    const debugData = (result.results || []).map(donation => {
      let parsed = null;
      let parseError = null;

      try {
        if (donation.notes && donation.notes.startsWith('{')) {
          parsed = JSON.parse(donation.notes);
        } else {
          parsed = { plain_text: donation.notes };
        }
      } catch (e) {
        parseError = e.message;
      }

      return {
        id: donation.id,
        amount: donation.amount,
        date: donation.date,
        raw_notes: donation.notes,
        raw_notes_type: typeof donation.notes,
        raw_notes_length: donation.notes ? donation.notes.length : 0,
        starts_with_brace: donation.notes ? donation.notes.startsWith('{') : false,
        parsed_notes: parsed,
        parse_error: parseError,
        extracted_type: parsed?.donation_type || 'cash'
      };
    });

    return new Response(JSON.stringify({
      success: true,
      debug: debugData,
      total: result.results?.length || 0
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}