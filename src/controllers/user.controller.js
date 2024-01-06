import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinery.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// uplode them to cloudinary, avatar
// create user objectv - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, passward } = req.body;

  if (
    [fullname, email, username, passward].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalPath = req.field?.avatar[0]?.path;
  const coverImageLocalPath = req.field?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user  = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    passward,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if(!createdUser){
    throw new ApiError(500 , "Somthing went wrong while registring a user")
  }

  return res.ststus(201).json(
    new ApiResponse(200 , createdUser , "User registered successfully")
  )

  console.log("\nusername: ", username);
  console.log("fullname: ", fullname);
  console.log("email: ", email);
  console.log("passward: ", passward);
  console.log("req.body:", req.body);
  console.log(existedUser);
  console.log(req.field?.avatar);
  console.log(req.field);
});

export { registerUser };
