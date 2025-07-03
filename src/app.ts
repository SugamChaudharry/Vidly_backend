import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./types/request"; // ✅ Force-load global types

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.routes";
import healthCheckRouter from "./routes/healthCheck.routes";
import tweetRouter from "./routes/tweet.routes";
import subscriptionRouter from "./routes/subscription.routes";
import videoRouter from "./routes/video.routes";
import commentRouter from "./routes/comment.routes";
import likeRouter from "./routes/like.routes";
import playlistRouter from "./routes/playlist.routes";
import dashboardRouter from "./routes/dashboard.routes";

//routes declaration
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// http://localhost:8000/api/v1/users/register

export { app };
