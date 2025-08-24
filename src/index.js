import express from "express";
import router from "./routes/index.routes.js";

const app = express();
const port = 3030;

app.use("/", router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});