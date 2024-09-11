import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinery.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy="title", sortType="asc", userId } = req.query;

  //TODO: get all videos based on query, sort, pagination
  const skip = (page - 1) * limit;
  const filter = query ? { $text: { $search: query } } : {};
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(new ApiResponse(404, "Invalid user id"));
    }
    filter.userId = userId;
  }
  const sort = sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {};
  const videos = await Video.find(filter).sort(sort).skip(skip).limit(limit);

  const totalVideos = await Video.countDocuments(filter);
  res.status(200).json(new ApiResponse(200, {
    totalVideos,
    page,
    limit,
    videos,
  }, "got all Videos successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video'
  if ([title, description].some((field) => field === "")) {
    throw new ApiError(400, "title and description are required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumbnail are required");
  }

  const videofile = await uploadOnCloudinary(videoLocalPath, "video");
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

  if (!videofile || !thumbnail) {
    throw new ApiError(500, "Failed to upload video or thumbnail");
  }

  const duration = videofile.duration;

  const video = await Video.create({
    title,
    description,
    videofile: videofile.url,
    thumbnail: thumbnail.url,
    duration,
    owner: req.user._id,
  });

  const createdVideo = await Video.findById(video._id).populate(
    "owner",
    "username email"
  );

  res
    .status(201)
    .json(new ApiResponse(200, createdVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(404, "Invalid video id"));
  }
  //TODO: get video by id
  const video = await Video.findById(videoId).populate(
    "owner",
    "username email"
  );
  console.log("video", video);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res.status(200).json(new ApiResponse(200, video, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(404, "Invalid video id"));
  }

  const { title, description } = req.body;

  if (!title || !description)
    throw new ApiError(404, "All fields are required");

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) throw new ApiError(404, "thumbnail not found");

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
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Avatar image updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(404, "Invalid video id"));
  }

  const video = await Video.findById(videoId);

  const videoFilePublicID = video.videofile.split("/").pop().split(".")[0];
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

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(404, "Invalid video id"));
  }

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

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
