const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function initializeDatabase() {
  console.log('=== Database Initialization ===');
  
  try {
    // 1. Check if the 'users' table already exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'users'");
    
    if (tables.length > 0) {
      console.log('Database tables already exist. Skipping schema setup and seeding.');
      return;
    }

    console.log('Database is empty. Initializing schema...');
    
    // 2. Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL by semicolon, clean statements, and filter out comments
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      await db.execute(statement);
    }
    console.log('Database schema imported successfully.');

    // 3. Seed initial users
    console.log('Seeding initial system users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('password123', salt);
    const userPasswordHash = await bcrypt.hash('password123', salt);

    const insertUserQuery = `
      INSERT INTO users (full_name, email, phone_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.execute(insertUserQuery, [
      'Alex Rivera',
      'admin@lumina.com',
      '+1 (555) 000-0000',
      adminPasswordHash,
      'admin'
    ]);

    await db.execute(insertUserQuery, [
      'Alexander Dupont',
      'alex@luxury.com',
      '+1 (555) 111-2222',
      userPasswordHash,
      'user'
    ]);

    // 4. Seed initial hotels
    console.log('Seeding initial hotels...');
    const insertHotelQuery = `
      INSERT INTO hotels (hotel_name, city, address, description, price_per_night, maximum_capacity, amenities, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Azure Oasis
    await db.execute(insertHotelQuery, [
      'Azure Oasis',
      'Santorini',
      'Oia Caldera Cliffs, Santorini, Greece',
      'A panoramic view of a luxury infinity pool overlooking a sunset at a Mediterranean resort. Minimalist white architecture.',
      450.00,
      4,
      'Infinity Pool, Spa, Ocean View, Private Caldera Terrace, Free Wi-Fi, Breakfast Included',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVy3FU1HURqfbdw4mbuC7kbxS9kqtPmWhoTmWfRGyIfAf4Dzt1yhwh_xCrh6psPGvMtqCPwOiVBp8ruDxHYTiFqpYCl3THSvA9EnxW4pNoH6WtkbpoetCiej7TPsa35klEC_r4uOqKlTy8aGlUeZFYkD80mJknY3N-EejdmWYQM4aiA6WhlQ65gpYGMldpS2qYfMOF1-xRAqqT9Ai0FwziCsfd8Q6IEpd7Y_56xbe_bJZDir16EGbceA'
    ]);

    // The Obsidian
    await db.execute(insertHotelQuery, [
      'The Obsidian',
      'Tokyo',
      '1-2 Chome, Shinjuku, Tokyo, Japan',
      'A modern urban skyscraper hotel room with floor-to-ceiling windows overlooking a shimmering city skyline at night. Dark wood, slate gray texturing.',
      620.00,
      2,
      'City View, Sky Lounge, Butler Service, 24/7 Room Service, High-Speed Wi-Fi, Fitness Center',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD424TgJ062iwYyEHU1Shb1PLZBBXo9MOsk5kFw14rSV14PkJejlpXkjpXW9dWT2ZKrQdCz9nIYz1vyAA5_LsgdNxCXrUlAI9alV_XfMu4Bw0B1ArxYbu_Z6lA7X1EcEu9893HZsR7uShK3JkcTwQwzC4i4PmDadrdtJCTLNYpgnhCmbNwFVDDMRajVbO_2gkO8WkrAI5kHEp6cD7A_FbV4PWIFxqzADpNcSoLJxdAzEXpo99GSY-TeCg'
    ]);

    // Canopy Retreat
    await db.execute(insertHotelQuery, [
      'Canopy Retreat',
      'Bali',
      'Jalan Raya Ubud, Bali, Indonesia',
      'An eco-luxury jungle retreat featuring sustainable bamboo architecture, an infinity pool blending into the tropical forest.',
      380.00,
      6,
      'Jungle View, Eco-Friendly, Private Pool, Yoga Shala, Spa, Guided Forest Tours, Organic Kitchen',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASBkNst4_vlYK7OYYta_w9EYqQvyDy4-fPBd4aVUq6zDSFFd0sZbhmrTs855IsitXHyMeqXSW9qWC5mz_QhUV879Tpr-JKAwaeTD-_uZ0GFFVTw4ZAxlHTXTRQ7bA9BxX_-F5uFtcWvWy-UlDEHSXiEZzwi0W9Fgp_AH5hBgXtWZSuxqmEJzq_FtJ4JwfC__Htw47QPRDHBhMBXQ7OO-cSeaDhXyQd_FN7OusxpcisdY_z42QBjXqe7w'
    ]);

    console.log('Database seeded successfully! 🌱');
  } catch (error) {
    console.error('Database auto-initialization failed:', error.message);
  }
}

module.exports = initializeDatabase;
