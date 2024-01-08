import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinery.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndReffreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave : false})

    return {accessToken , refreshToken}

  } catch (error) {
    throw new ApiError(500, "Somthing went wrong while generating refresh and access token")
    
  }
}

// // todos for registring a user
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
  const { username, fullname, email, password } = req.body;

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;

  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Somthing went wrong while registring a user");
  }
  // console.log("\nusername: ", username);
  // console.log("fullname: ", fullname);
  // console.log("email: ", email);
  // console.log("password: ", password);
  // console.log("req.body:", req.body);
  // console.log(existedUser);
  // console.log(req.files?.avatar);
  // console.log(req.files);

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// // todos for login a user
// req body -> data
// username or email
// find tha user
// password check
// access and refresh tocken
// send cookies

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(
      400,
      `${
        !username && !email
          ? "Username and email"
          : !username
            ? "username"
            : !email
              ? "email"
              : "God knows what is missing"
      } is required`
    );
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "invalid user credentials");
    }

    const {accessToken , refreshToken} = await generateAccessAndReffreshTokens(user._id)

    const loggedInUser = User.findById(user._id).select(" -password -refreshToken")

    const options = {
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accesToken", accessToken, options)
    .cookie("refreshToken", refreshToken , options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken , refreshToken
      },
      "User logged In Successfully"
      )
    )
});


const logoutUser = asyncHandler(async(req,res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesToken", options)
    .cookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        "User logged In Successfully"
      )
    );
})

export { registerUser, loginUser  , logoutUser};
