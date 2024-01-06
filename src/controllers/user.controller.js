import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async ( req , res) => {
    res.status(200).json({
        message: "chai our code"
    })
})

export {registerUser}