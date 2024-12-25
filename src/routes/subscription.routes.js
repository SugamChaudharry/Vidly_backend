import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    getVideoSubscriber,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router
    .route("/:channelId")
    .get(getVideoSubscriber);

router.route("/").get(getSubscribedChannels);

export default router
