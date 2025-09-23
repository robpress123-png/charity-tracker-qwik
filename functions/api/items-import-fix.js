export async function onRequest({ env, request }) {
  // Category ID to Name mapping based on item_categories table
  const categoryMapping = {
    1: 'Clothing - Women',
    2: 'Clothing - Men',
    3: 'Clothing - Children',
    4: 'Household Items',
    5: 'Electronics',
    6: 'Furniture',
    7: 'Books & Media',
    8: 'Sports & Recreation',
    9: 'Toys & Games',
    10: 'Appliances',
    11: 'Jewelry & Accessories',
    12: 'Tools & Equipment'
  };

  try {
    // Read the CSV data from the request
    const csvText = await request.text();
    const lines = csvText.trim().split('\n');

    // Skip header
    const dataLines = lines.slice(1);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const line of dataLines) {
      try {
        // Parse CSV line (handle commas in quoted fields)
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());

        const [category_id, name, description, unit, value_good, value_very_good, value_excellent] = parts;

        // Get the correct category name from the mapping
        const categoryName = categoryMapping[parseInt(category_id)];

        if (!categoryName) {
          throw new Error(`Unknown category ID: ${category_id}`);
        }

        // Calculate low and high values from the CSV values
        const low_value = parseFloat(value_good) || 0;
        const high_value = parseFloat(value_excellent) || 0;

        // Insert into items table with correct category name
        await env.DB.prepare(`
          INSERT INTO items (id, name, category, low_value, high_value)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          name,
          categoryName,  // Use the mapped category name
          low_value,
          high_value
        ).run();

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Line ${dataLines.indexOf(line) + 2}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Import complete: ${successCount} items imported successfully, ${errorCount} errors`,
      errors: errors.slice(0, 10) // Only show first 10 errors
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
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