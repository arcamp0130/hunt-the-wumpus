import { fileURLToPath } from "url";
import express from "express";
import router from "./routes/index.routes.js";
import path from "path";

const app = express();
const port = process.env.PORT || 5500;

// getting curent directory and file name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// verifying environment to set static files path
const staticPath = process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../dist/public")
    : path.join(__dirname, "public");

app.use(express.static(staticPath));
app.use("/", router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});