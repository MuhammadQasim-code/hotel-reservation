const db = require('../config/db');

class User {
  static async create({ fullName, email, phoneNumber, passwordHash, role = 'user' }) {
    const query = `
      INSERT INTO users (full_name, email, phone_number, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(query, [fullName, email, phoneNumber, passwordHash, role]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0] || null;
  }

  static async findByPhone(phoneNumber) {
    const query = 'SELECT * FROM users WHERE phone_number = ?';
    const [rows] = await db.execute(query, [phoneNumber]);
    return rows[0] || null;
  }

  static async findById(id) {
    const query = 'SELECT id, full_name, email, phone_number, role, created_at, updated_at FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async getAll() {
    const query = 'SELECT id, full_name, email, phone_number, role, created_at, updated_at FROM users ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async updateProfile(id, { fullName, email, phoneNumber }) {
    const query = `
      UPDATE users 
      SET full_name = ?, email = ?, phone_number = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(query, [fullName, email, phoneNumber, id]);
    return result.affectedRows > 0;
  }

  static async countAll() {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  }
}

module.exports = User;
