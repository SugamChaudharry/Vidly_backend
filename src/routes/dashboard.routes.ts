import { Router } from "express";
import { getChannelStats } from "../controllers/dashboard.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.route("/stats").get(getChannelStats);

export default router;
