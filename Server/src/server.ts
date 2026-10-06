import express, { Request, Response } from "express";
import { connectDB } from "./DB/ConnectDB";

const app = express();
const PORT = 3000;

app.get("/", (req: Request, res: Response) => {
  console.log("Hello world");
});

connectDB()
  .then(() => {
    console.log("Database connection established, starting server...");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err: Error) => {
    console.log("Failed to connect to database, server not started", err);
  });


