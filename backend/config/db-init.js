const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function initializeDatabase() {
  console.log('=== Database Initialization ===');
  
  let retries = 10;
  let delay = 10000; // 10 seconds between retries

  while (retries > 0) {
    try {
      // 1. Create tables if they do not exist
      console.log('Verifying database schema...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute the entire schema in one call using multipleStatements: true
      await db.query(schemaSql);
      console.log('Database schema verified/created successfully.');

      // 2. Seed initial users if table is empty
      const [userRows] = await db.execute("SELECT COUNT(*) as count FROM users");
      if (userRows[0].count === 0) {
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
        console.log('Users seeded successfully.');
      } else {
        console.log('Users table already populated. Skipping user seed.');
      }

      // 3. Seed initial hotels if table is empty
      const [hotelRows] = await db.execute("SELECT COUNT(*) as count FROM hotels");
      if (hotelRows[0].count === 0) {
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
        console.log('Hotels seeded successfully.');
      } else {
        console.log('Hotels table already populated. Skipping hotel seed.');
      }

      console.log('Database auto-initialization complete! 🌱');
      return; // Success, exit loop

    } catch (error) {
      console.error(`Database initialization attempt failed (retries left: ${retries - 1}):`, error.message);
      retries--;
      if (retries === 0) {
        console.error('Database auto-initialization failed permanently after all retries.');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = initializeDatabase;
