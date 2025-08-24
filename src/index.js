import { fileURLToPath } from "url";
import express from "express";
import router from "./routes/index.routes.js";
import path from "path";

const app = express();
const port = 3030;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use("/", router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});