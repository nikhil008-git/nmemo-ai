import "dotenv/config";
import express from "express";
import cors from "cors";
import { requireSession } from "./middleware/requireSession.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/protected", requireSession, (req, res) => {
    res.json({ message: "Protected route" });
});

app.listen(8080, () => {
    console.log("Backend running on http://localhost:8080");
});

console.log('done check')
