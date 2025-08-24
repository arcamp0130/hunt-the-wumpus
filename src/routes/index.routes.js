import { Router } from "express";

const router = Router();
const rootDir = "src/public";

// Define route for root path
router.get("/", (req, res) => {
    res.sendFile("index.html", { root: rootDir });
});

export default router;