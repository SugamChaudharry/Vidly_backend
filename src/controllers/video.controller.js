import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinery.js";
import { v2 as cloudinary } from 'cloudinary';


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
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
  //TODO: update video details like title, description,

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json(new ApiResponse(404, "Invalid video id"));
  }

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;

  console.log("thumbnailLocalPath", thumbnailLocalPath);
  // const video = await Video.findById(videoId);
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title || video.title,
        description: description || video.description,
      },
    },
    { new: true }
  );

  console.log("video", video);

  if (thumbnailLocalPath) {
    const thumbnailPublicID = video.thumbnail.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(thumbnailPublicID);

    // Upload new thumbnail to Cloudinary
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadedThumbnail.url) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    // Update video document with new thumbnail URL
    video.thumbnail = uploadedThumbnail.url;
    await video.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Avatar image updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
