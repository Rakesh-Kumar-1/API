import pool from "../db.js";

export const createUserTable = async () => {
  const query1 = `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  const query2 = `
    CREATE TABLE IF NOT EXISTS events (
      event_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      event_date TIMESTAMP NOT NULL,
      location VARCHAR(255) NOT NULL,
      capacity INT CHECK (capacity > 0 AND capacity <= 1000) NOT NULL
    );
  `;
  
  const query3 = `
    CREATE TABLE IF NOT EXISTS event_registrations (
      registration_id SERIAL PRIMARY KEY,
      event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
      registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (event_id, user_id)
    );
  `;
  
  try {
    await Promise.all([
      pool.query(query1),
      pool.query(query2),
      pool.query(query3),
    ]);
    console.log('Tables created or already exist.');
  } catch (error) {
    console.log('Error :', error);
  }
};
