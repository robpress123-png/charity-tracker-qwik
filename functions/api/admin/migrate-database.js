/**
 * Database migration to add missing columns
 * Run this through the admin panel to update the database schema
 */

export async function onRequestPost(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Database not available'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  const migrations = [];
  const errors = [];

  try {
    // Check which columns exist
    const tableInfo = await env.DB.prepare("PRAGMA table_info(donations)").all();
    const existingColumns = new Set(tableInfo.results.map(col => col.name));

    // Define columns that should exist
    const requiredColumns = {
      // Stock donation columns
      'stock_symbol': 'TEXT',
      'stock_quantity': 'REAL',
      'fair_market_value': 'REAL',

      // Crypto donation columns
      'crypto_symbol': 'TEXT',
      'crypto_quantity': 'REAL',
      'crypto_type': 'TEXT',

      // Miles donation columns
      'miles_driven': 'REAL',
      'mileage_rate': 'REAL',
      'mileage_purpose': 'TEXT',

      // Items donation columns
      'item_description': 'TEXT',
      'estimated_value': 'REAL',

      // Receipt
      'receipt_url': 'TEXT'
    };

    // Add missing columns
    for (const [column, type] of Object.entries(requiredColumns)) {
      if (!existingColumns.has(column)) {
        try {
          await env.DB.prepare(`ALTER TABLE donations ADD COLUMN ${column} ${type}`).run();
          migrations.push(`Added column: ${column} (${type})`);
        } catch (error) {
          if (!error.message.includes('duplicate column')) {
            errors.push(`Failed to add ${column}: ${error.message}`);
          }
        }
      } else {
        migrations.push(`Column already exists: ${column}`);
      }
    }

    // Check if donation_items table exists
    try {
      await env.DB.prepare("SELECT 1 FROM donation_items LIMIT 1").run();
      migrations.push("Table donation_items exists");
    } catch {
      // Create donation_items table
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS donation_items (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          donation_id TEXT NOT NULL,
          item_name TEXT NOT NULL,
          category TEXT,
          condition TEXT,
          quantity INTEGER DEFAULT 1,
          unit_value REAL,
          total_value REAL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
        )
      `).run();
      migrations.push("Created donation_items table");
    }

    // Check if user_charities table exists
    try {
      await env.DB.prepare("SELECT 1 FROM user_charities LIMIT 1").run();
      migrations.push("Table user_charities exists");
    } catch {
      // Create user_charities table
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS user_charities (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          ein TEXT,
          category TEXT,
          website TEXT,
          description TEXT,
          is_approved BOOLEAN DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();
      migrations.push("Created user_charities table");
    }

    // Add user_charity_id column to donations if missing
    if (!existingColumns.has('user_charity_id')) {
      try {
        await env.DB.prepare(`ALTER TABLE donations ADD COLUMN user_charity_id TEXT`).run();
        migrations.push("Added user_charity_id column to donations");
      } catch (error) {
        if (!error.message.includes('duplicate column')) {
          errors.push(`Failed to add user_charity_id: ${error.message}`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Migration completed',
      migrations,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      migrations,
      errors
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}