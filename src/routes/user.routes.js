import { Router } from "express";
import { changeCurrentPassword, loginUser, logoutUser, refreshAccesstoken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
    );

    router.route("/login").post(loginUser)

    router.route("/logout").post(verifyJWT, logoutUser)

    router.route("/refresh-token").post(refreshAccesstoken)

    router.route("/change-password").post(verifyJWT,changeCurrentPassword);

    router.route("/update-Account-Details").post(verifyJWT,updateAccountDetails);

    router.route("/update-Avatar").post(verifyJWT,updateUserAvatar);

    router.route("/update-CoverImage").post(verifyJWT,updateUserCoverImage);
    
export default router;
