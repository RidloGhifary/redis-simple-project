import express, { Application, Request, Response } from "express";
import axios from "axios";
import { createClient } from "redis";

const app: Application = express();
const port: number = 3210;

const client = createClient();

client.on("error", (err) => {
  console.log("Redis error =>", err);
});

client.connect();

app.get("/api/photos", async (req: Request, res: Response) => {
  try {
    const data = await client.get("photos");
    if (data) {
      console.log("cache hit");
      res.status(200).json(JSON.parse(data));
    } else {
      console.log("cache miss");
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/photos"
      );
      const photos = response.data;

      await client.setEx("photos", 10, JSON.stringify(photos));
      res.status(200).json(photos);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
