import { Pool } from "pg";
import dotenv from "dotenv"

dotenv.config();


const pool = new Pool({
  connectionString:process.env.DATABASE_URL,
  max:20,
  idleTimeoutMillis : 30000,
  connectionTimeoutMillis : 2000

});

export const connectDB = async () : Promise<void> => {
  const client = await pool.connect()
  try {
    await client.query("SELECT 1");
    console.log("Database connection pool verified successfully");

  }finally {
    client.release()
  }
};

export default pool;

