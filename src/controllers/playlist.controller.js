import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (
    !name ||
    !description ||
    [name, description].some((field) => field?.trim() === "")
  )
    throw new ApiError(400, "all fields are required");
  const playlist = await Playlist.create({
    playlistName: name,
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

  const playlist = await Playlist.find({ owner: userId });
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetch successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId))
    throw new ApiError(404, "playlist id not valid");

  const playlist = await Playlist.findById(playlistId);
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetch successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(404, "id not valid");

  const playlist = await Playlist.findById(playlistId);
  playlist.videos.push(videoId);
  playlist.save();
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video add successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(404, "id not valid");

  const playlist = await Playlist.findById(playlistId);
  const newPlaylist = playlist.videos.filter((id) => id != videoId);
  playlist.videos = newPlaylist;
  playlist.save();
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video add successfully"));
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
