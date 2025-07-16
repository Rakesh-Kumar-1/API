import pool from "../db.js";

export const createEvent = async (req, res) => {
  const { title, event_date, location, capacity } = req.body;
  try {
    if (capacity <= 1000 && capacity >= 0) {
      const result = await pool.query(
        "INSERT INTO events (title,event_date,location,capacity) VALUES ($1,$2,$3,$4) RETURNING *",
        [title, event_date, location, capacity]
      );
      return res
        .status(201)
        .json({
          status: true,
          message: "User created successfully",
          data: result.row[0],
        });
    } else {
      return res
        .status(200)
        .json({ status: true, message: "Decrease your capacity" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, message: "Something went wrong", error: err });
  }
};
export const eventDetails = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.event_id, e.title, e.event_date, e.location, e.capacity,u.user_id, u.name, u.email, er.registration_date
        FROM events e
        LEFT JOIN event_registrations er ON e.event_id = er.event_id
        LEFT JOIN users u ON er.user_id = u.user_id
        WHERE e.event_id = $1`,[req.params.eventId]);
    return res.status(200).json({ status: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Error occured", error: err });
  }
};
export const registerForEvent = async (req, res) => {
  const { username, useremail, eventId } = req.body;
  try {

        const result = await pool.query(`SELECT event_id, event_date, capacity FROM events WHERE event_id = $1 AND event_date > NOW()`,[eventId]);

        if (result.rowCount === 0) {
          return res.status(400).json({ status: false, message: "Event does not exist."});
        }

        const event = result.rows[0];

        const registrationCountQuery = await pool.query(`SELECT COUNT(*) FROM event_registrations WHERE event_id = $1`,[eventId]);

        const seats = parseInt(registrationCountQuery.rows[0].count, 10);

        if (seats >= event.capacity) {
          return res.status(400).json({ status:true, message: 'Event is full cannot register'});
        }

        const user = await pool.query(`SELECT * FROM users WHERE email = $1`,[useremail]);

        let userId;
        if (user.rows.length === 0) {
            const value = await pool.query(`INSERT INTO users (name, email) VALUES ($1, $2) RETURNING user_id`, [username, useremail]);
            userId = value.rows[0].user_id;
        } else {
            userId = userResult.rows[0].user_id;
        }

        const duplicate = await pool.query(`SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2`,[eventId, userId]);

        if (duplicate.rows.length > 0) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

     
        await pool.query(`INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)`,[eventId, userId]);
        return res.status(200).json({ message: 'Registration successful' });
    }catch(error){
        return res.status(500).json({status:false, message:"Error happened in catch block", error:error});
    }
};
export const cancelRegistration = async (req, res) => {
    const { useremail, eventId } = req.body;
    try{
        const userResult = await pool.query(`SELECT user_id FROM users WHERE email = $1`,[useremail]);
        const userId = userResult.rows[0].user_id;

        const registrationResult = await pool.query(`SELECT * FROM event_registrations WHERE event_id = $1 AND user_id = $2`,[eventId, userId]);

        if (registrationResult.rows.length === 0) {
            return res.status(400).json({ message: 'You are not registered for this event' });
        }
        await pool.query(`DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2`,[eventId, userId]);
        return res.status(200).json({ message: 'Registration cancelled'});
}catch(error){
    return res.status(500).json({status:false, message:"Error in catch block", error:error});
}
};
export const upcomingEvent = async (req, res) => {
    const future = await pool.query(`SELECT * FROM events WHERE event_date > NOW() ORDER BY event_date ASC,location ASC`);
    try{
        if (future.rows.length === 0) {
          return res.status(404).json({ message: 'No upcoming events'});
        }
        res.status(200).json(future.rows);
    }catch (error) {
        res.status(500).json({ message: 'Catch block error',error:error });
    }
};
export const eventStats = async (req, res) => {
    try{
        const result = await pool.query(`SELECT e.event_id, e.title, e.capacity, COUNT(er.user_id) AS total_registrations,
        (e.capacity - COUNT(er.user_id)) AS remaining_capacity, ROUND((COUNT(er.user_id) * 100.0 / e.capacity), 2) AS percentage_capacity_used
        FROM events e LEFT JOIN event_registrations er ON e.event_id = er.event_id WHERE e.event_id = $1 GROUP BY e.event_id;`,[req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Event is not present' });
        }
        res.status(200).json(result.rows[0]);
    }catch(error){
        return res.status(500).json({message: "error in catch block"});
    }
};
