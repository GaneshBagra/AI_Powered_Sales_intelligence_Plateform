import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "admin",
  database: "ganesh",
});

export const connectDB = async () => {
  return await pool.connect()
};

export default pool;

