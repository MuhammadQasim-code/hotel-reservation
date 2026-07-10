const db = require('../config/db');

class Hotel {
  static async create({ hotelName, city, address, description, pricePerNight, maximumCapacity, amenities, imageUrl }) {
    const query = `
      INSERT INTO hotels (hotel_name, city, address, description, price_per_night, maximum_capacity, amenities, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      hotelName,
      city,
      address,
      description,
      pricePerNight,
      maximumCapacity,
      amenities,
      imageUrl
    ]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM hotels WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async findAll({ search = '', city = '' } = {}) {
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (hotel_name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async update(id, { hotelName, city, address, description, pricePerNight, maximumCapacity, amenities, imageUrl }) {
    let query = `
      UPDATE hotels 
      SET hotel_name = ?, city = ?, address = ?, description = ?, price_per_night = ?, maximum_capacity = ?, amenities = ?
    `;
    const params = [hotelName, city, address, description, pricePerNight, maximumCapacity, amenities];

    if (imageUrl !== undefined) {
      query += ', image_url = ?';
      params.push(imageUrl);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM hotels WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM hotels');
    return rows[0].count;
  }
}

module.exports = Hotel;
