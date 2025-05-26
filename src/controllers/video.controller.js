import mongoose from "mongoose";
import { Video, DEFAULT_VIDEO_TAGS } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model.js";
import { WatchHistory } from "../models/watchHistory.model.js";
import fs from "fs";

// GET /videos?sortBy=views,createdAt&sortType=desc,asc
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = ["views", "createdAt"],
    sortType = ["desc", "desc"],
    userId,
    tag,
  } = req.query;

  const skip = (page - 1) * limit;
  const matchStage = { isPublished: true };

  if (query) {
    matchStage.$text = { $search: query };
  }
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(new ApiResponse(404, "Invalid user id"));
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }
  if (tag) {
    matchStage.tags = tag;
  }

  // Create the sort stage dynamically for multiple fields
  const sortStage = {};
  if (Array.isArray(sortBy) && Array.isArray(sortType)) {
    sortBy.forEach((field, index) => {
      const order = sortType[index] === "desc" ? -1 : 1;
      sortStage[field] = order;
    });
  }

  const pipeline = [
    { $match: matchStage }, // Filter stage
    {
      $lookup: {
        from: "users", // The collection to join with
        localField: "owner", // The field in the `videos` collection
        foreignField: "_id", // The field in the `users` collection
        as: "owner",
      },
    },
    { $unwind: "$owner" }, // Convert the array created by `$lookup` into an object
    {
      $project: {
        thumbnail: 1,
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        isPublished: 1,
        tags: 1,
        "owner.fullName": 1,
        "owner.userName": 1,
        "owner.avatar": 1,
        createdAt: 1,
      },
    },
    { $sort: sortStage }, // Sorting stage
    { $skip: skip }, // Pagination: skip documents
    { $limit: parseInt(limit, 10) }, // Pagination: limit the number of documents
  ];

  // Add a separate pipeline to count the total number of documents matching the filters
  const countPipeline = [{ $match: matchStage }, { $count: "totalVideos" }];

  const [videos, totalVideosResult] = await Promise.all([
    Video.aggregate(pipeline), // Fetch the paginated and sorted results
    Video.aggregate(countPipeline), // Count the total number of videos
  ]);

  const totalVideos =
    totalVideosResult.length > 0 ? totalVideosResult[0].totalVideos : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        page,
        limit,
        videos,
      },
      "Got all Videos successfully"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  let tags = req.body.tags;

  // Parse tags if it's a string
  if (typeof tags === "string") {
    try {
      tags = JSON.parse(tags);
    } catch (error) {
      throw new ApiError(400, "Invalid tags format");
    }
  }

  if ([title, description].some((field) => field === "")) {
    throw new ApiError(400, "title and description are required");
  }

  if (!Array.isArray(tags) || tags.length === 0) {
    throw new ApiError(400, "At least one tag is required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumbnail are required");
  }

  // Function to clean up temporary files
  const cleanupTempFiles = () => {
    try {
      if (req.files?.videoFile?.[0]?.path) {
        fs.unlinkSync(req.files.videoFile[0].path);
      }
      if (req.files?.thumbnail?.[0]?.path) {
        fs.unlinkSync(req.files.thumbnail[0].path);
      }
    } catch (error) {
      console.log("Error cleaning up files:", error);
    }
  };

  try {
    const videoFile = await uploadOnCloudinary(videoLocalPath, "video");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

    if (!videoFile || !thumbnail) {
      throw new ApiError(500, "Failed to upload video or thumbnail");
    }

    const duration = videoFile.duration;

    const video = await Video.create({
      title,
      description,
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      duration,
      owner: req.user._id,
      tags,
    });

    const createdVideo = await Video.findById(video._id).populate(
      "owner",
      "userName email"
    );

    res
      .status(201)
      .json(new ApiResponse(200, createdVideo, "Video published successfully"));
  } catch (error) {
    cleanupTempFiles();
    throw error;
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(404, "Invalid video ID");
  }

  // Remove any existing entry for this video in user's watch history
  await WatchHistory.deleteOne({
    user: req.user._id,
    video: videoId
  });

  // Add new watch history entry
  await WatchHistory.create({
    user: req.user._id,
    video: videoId
  });

  // Maintain 50 video limit in watch history
  const count = await WatchHistory.countDocuments({ user: req.user._id });
  if (count > 50) {
    const oldest = await WatchHistory.find({ user: req.user._id })
      .sort({ watchedAt: 1 })
      .limit(count - 50)
      .select('_id');

    const idsToDelete = oldest.map(doc => doc._id);
    await WatchHistory.deleteMany({ _id: { $in: idsToDelete } });
  }

  // Update user's tag preferences
  const user = await User.findById(req.user._id);
  const video = await Video.findById(videoId);
  if (video) {
    await user.updateTagPreferences(video.tags);
  }

  // Increment video views
  await Video.updateOne({ _id: videoId }, { $inc: { views: 1 } });

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              foreignField: "channel",
              localField: "_id",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: "$subscribers.subscriber",
            },
          },
          {
            $addFields: {
              subscriberCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user._id, "$subscribers"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              userName: 1,
              avatar: 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        owner: 1,
        tags: 1,
      },
    },
  ];

  const result = await Video.aggregate(pipeline);

  if (!result || result.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  const videoData = result[0];
  res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  let tags = req.body.tags;
  const thumbnailLocalPath = req.file?.path;

  // Function to clean up temporary files
  const cleanupTempFiles = () => {
    try {
      if (thumbnailLocalPath) {
        fs.unlinkSync(thumbnailLocalPath);
      }
    } catch (error) {
      console.log("Error cleaning up files:", error);
    }
  };

  // Parse tags if it's a string
  if (typeof tags === "string") {
    try {
      tags = JSON.parse(tags);
    } catch (error) {
      throw new ApiError(400, "Invalid tags format");
    }
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      throw new ApiError(404, "invalid params id");
    }

    if (!title || !description) {
      throw new ApiError(404, "All fields are required");
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      throw new ApiError(400, "At least one tag is required");
    }

    if (!thumbnailLocalPath) {
      console.log(thumbnailLocalPath, req);
      throw new ApiError(404, "thumbnail not found");
    }

    const video = await Video.findById(videoId);

    const thumbnailPublicID = video.thumbnail.split("/").pop().split(".")[0];

    cloudinary.uploader.destroy(thumbnailPublicID).then(console.log);

    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedThumbnail.url) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    const response = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title: title,
          description: description,
          thumbnail: uploadedThumbnail.url,
          tags: tags,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Video updated successfully"));
  } catch (error) {
    cleanupTempFiles();
    throw error;
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new ApiError(404, "invalid params id");

  const video = await Video.findById(videoId);

  const videoFilePublicID = video.videoFile.split("/").pop().split(".")[0];
  const thumbnailFilePublicID = video.thumbnail.split("/").pop().split(".")[0];

  cloudinary.uploader
    .destroy(videoFilePublicID, { resource_type: "video" })
    .then(console.log);
  cloudinary.uploader.destroy(thumbnailFilePublicID).then(console.log);

  const response = await Video.findByIdAndDelete(videoId);
  console.log("deleted video : ", response);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted  successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId))
    throw new ApiError(404, "invalid params id");

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json(new ApiResponse(404, "Video not found"));
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

const getUserVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = ["createdAt"],
    sortType = ["desc"],
  } = req.query;

  const skip = (page - 1) * limit;
  const matchStage = { owner: req.user._id }; // Get videos of logged-in user

  // Create the sort stage dynamically for multiple fields
  const sortStage = {};
  if (Array.isArray(sortBy) && Array.isArray(sortType)) {
    sortBy.forEach((field, index) => {
      const order = sortType[index] === "desc" ? -1 : 1;
      sortStage[field] = order;
    });
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        thumbnail: 1,
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        isPublished: 1,
        tags: 1,
        "owner.fullName": 1,
        "owner.userName": 1,
        "owner.avatar": 1,
        createdAt: 1,
      },
    },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: parseInt(limit, 10) },
  ];

  const countPipeline = [{ $match: matchStage }, { $count: "totalVideos" }];

  const [videos, totalVideosResult] = await Promise.all([
    Video.aggregate(pipeline),
    Video.aggregate(countPipeline),
  ]);

  const totalVideos = totalVideosResult.length > 0 ? totalVideosResult[0].totalVideos : 0;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        page,
        limit,
        videos,
      },
      "Got user's videos successfully"
    )
  );
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const result = await WatchHistory.deleteOne({
    user: req.user._id,
    video: videoId
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Video not found in watch history");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video removed from watch history successfully"));
});

const clearWatchHistory = asyncHandler(async (req, res) => {
  const result = await WatchHistory.deleteMany({
    user: req.user._id
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        "Watch history cleared successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
  removeFromWatchHistory,
  clearWatchHistory,
};
