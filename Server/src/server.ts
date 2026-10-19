import express, {Application, Request, Response } from "express";
import cors from "cors"
import dotenv from "dotenv";
import prisma from "./DB/Prisma";
import authRoutes from "./routes/auth.routes"
import orderRoutes from "./routes/order.route"

dotenv.config()
const app : Application= express();
const PORT = process.env.PORT || 3000;

app.use(express.json()) 
app.use(express.urlencoded({
  extended:true
}))
app.use(cors({
  origin : ["http://localhost:5173"],
  credentials : true
}))


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    message : "server is healthy and running",
    status : "OK",
    timestamp : new Date().toISOString()
  })
});
// Auth routes
app.use("/api/auth", authRoutes)
app.use("/api/order", orderRoutes)



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


