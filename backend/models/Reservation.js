const db = require('../config/db');

class Reservation {
  static async create({
    userId,
    hotelId,
    customerName,
    phoneNumber,
    reservationDate,
    reservationDay,
    numberOfPersons,
    mealPreference,
    stayType,
    specialNotes = ''
  }) {
    const query = `
      INSERT INTO reservations 
      (user_id, hotel_id, customer_name, phone_number, reservation_date, reservation_day, number_of_persons, meal_preference, stay_type, special_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;
    const [result] = await db.execute(query, [
      userId,
      hotelId,
      customerName,
      phoneNumber,
      reservationDate,
      reservationDay,
      numberOfPersons,
      mealPreference,
      stayType,
      specialNotes
    ]);
    return result.insertId;
  }

  static async findById(id) {
    const query = `
      SELECT r.*, h.hotel_name, h.city, h.address, h.price_per_night, h.image_url, u.full_name as user_name, u.email as user_email
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT r.*, h.hotel_name, h.city, h.price_per_night, h.image_url
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async findAll() {
    const query = `
      SELECT r.*, h.hotel_name, h.city, h.price_per_night, u.full_name as user_name, u.email as user_email
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async update(id, {
    customerName,
    phoneNumber,
    reservationDate,
    reservationDay,
    numberOfPersons,
    mealPreference,
    stayType,
    specialNotes
  }) {
    const query = `
      UPDATE reservations 
      SET customer_name = ?, phone_number = ?, reservation_date = ?, reservation_day = ?, number_of_persons = ?, meal_preference = ?, stay_type = ?, special_notes = ?
      WHERE id = ? AND status = 'Pending'
    `;
    const [result] = await db.execute(query, [
      customerName,
      phoneNumber,
      reservationDate,
      reservationDay,
      numberOfPersons,
      mealPreference,
      stayType,
      specialNotes,
      id
    ]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Users can cancel (delete) only when status is Pending
    const query = "DELETE FROM reservations WHERE id = ? AND status = 'Pending'";
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async updateStatus(id, status) {
    const query = 'UPDATE reservations SET status = ? WHERE id = ?';
    const [result] = await db.execute(query, [status, id]);
    return result.affectedRows > 0;
  }

  static async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM reservations');
    return rows[0].count;
  }

  static async countByStatus(status) {
    const query = 'SELECT COUNT(*) as count FROM reservations WHERE status = ?';
    const [rows] = await db.execute(query, [status]);
    return rows[0].count;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM reservations
    `;
    const [rows] = await db.execute(query);
    return {
      total: rows[0].total || 0,
      pending: rows[0].pending || 0,
      approved: rows[0].approved || 0,
      rejected: rows[0].rejected || 0,
      completed: rows[0].completed || 0
    };
  }
}

module.exports = Reservation;
