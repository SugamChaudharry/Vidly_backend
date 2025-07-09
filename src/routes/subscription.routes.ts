import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  getVideoSubscriber,
  toggleSubscription,
} from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJWT);

router
  .route("/c/:channelId")
  .get(getUserChannelSubscribers)
  .post(toggleSubscription);

router.route("/:channelId").get(getVideoSubscriber);

router.route("/").get(getSubscribedChannels);

export default router;
