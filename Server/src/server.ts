import express, {Application, Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv";
import prisma from "./DB/Prisma";
import authRoutes from "./routes/auth.routes"

dotenv.config()
const app : Application= express();
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
// Auth routes
app.use("/api/auth", authRoutes)



const startServer = async () => {

  try {

    await prisma.$connect()
    console.log("Connected to the database successfully Via prisma.");
    app.listen(PORT,() => {
      console.log(`Server is running on port ${PORT}`);
    })
  } catch (err : Error | unknown) {
    console.error("Failed to start the server:", err);
    process.exit(1);
  }
}

startServer();


