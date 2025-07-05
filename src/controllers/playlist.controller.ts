import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (
    !title ||
    !description ||
    [title, description].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "all fields are required");
  const playlist = await Playlist.create({
    playlistName: title,
    description: description,
    owner: req.user._id,
    videos: [],
  });
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(404, "user id not valid");

  const playlist = await Playlist.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      $addFields: {
        firstVideo: { $arrayElemAt: ["$videos", 0] },
      },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "firstVideo",
        as: "firstVideo",
      },
    },
    {
      $addFields: {
        thumbnail: "$firstVideo.thumbnail",
        videos: { $size: "$videos" },
      },
    },
    {
      $addFields: {
        thumbnail: {
          $cond: {
            if: { $gt: [{ $size: "$thumbnail" }, 0] },
            then: { $arrayElemAt: ["$thumbnail", 0] },
            else: null,
          },
        },
      },
    },
    {
      $project: {
        playlistName: 1,
        description: 1,
        videos: 1,
        thumbnail: 1,
        createdAt: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetch successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(404, "playlist id not valid");

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        foreignField: "_id",
        localField: "videos",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },
    {
      $project: {
        playlistName: 1,
        description: 1,
        videos: 1,
        owner: 1,
        createdAt: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "playlist fetch successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(404, "id not valid");

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, videos: { $ne: videoId } },
    { $push: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(
      400,
      "Video already exists in playlist or playlist not found"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(404, "id not valid");

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $pull: { videos: videoId } },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(404, "user id not valid");
  await Playlist.findByIdAndDelete(playlistId);
  res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId))
    throw new ApiError(404, "user id not valid");
  if (!name || [name, description].some((field) => field?.trim() === ""))
    throw new ApiError(400, "all fields are required");
  const newPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        playlistName: name,
        description: description,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, newPlaylist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
