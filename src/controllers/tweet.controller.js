import mongoose, { isValidObjectId, Types } from "mongoose"
import {Tweet} from "../models/tweets.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    if(content === "")
        throw new ApiError(400, "content is required");
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id,
    })
    return res.status(200).json(new ApiResponse(200, tweet, "tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if(!mongoose.Types.ObjectId.isValid(userId))
        throw new ApiError(404, "invalid params id")

    const tweets = await Tweet.find({
        owner: userId
    })

    console.log("tweets : ", tweets);
    if(!tweets) {
        throw new ApiError(404, "tweets not found");
    }
    return res.status(200).json(new ApiResponse(200, tweets, "tweets found successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if(!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError(404, "invalid params id")

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content:content
        }
    } , {new:true})

    return res.status(200).json(new ApiResponse(200,  tweet, "tweet update successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError(404, "invalid params id")

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
