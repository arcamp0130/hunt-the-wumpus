import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const port = 3030;

// Getting current filename and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});