import express, { Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv";
import { connectDB } from "./DB/ConnectDB";

dotenv.config()
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()) 
app.use(cors())


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message : "server is healthy and running",
    status : "OK",
    timestamp : new Date().toISOString()
  })
});

const startServer = async () => {
  connectDB().then(() => {
    app.listen(PORT,() => {
      console.log(`Server is running on port ${PORT}`);
    })
  }).catch((err : Error) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); 
  })
}

startServer();


