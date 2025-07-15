import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import eventRoutes from './routes/eventRoutes.js'
import { createUserTable } from './data/createtable.js';

dotenv.config({});

const PORT = process.env.PORT || 7000;
const app = express();

app.use(express.json());
app.use(cors);

app.use("/event",eventRoutes)

createUserTable();

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
