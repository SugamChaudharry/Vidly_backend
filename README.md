# Vidly Backend

A robust backend API for a video streaming platform built with Node.js, Express, and MongoDB. Vidly provides a feature-rich video streaming experience with advanced user preferences, analytics, and content management capabilities.

## 🌐 Live Demo

Visit the live demo at: [https://vidly.sugamwtw.tech/](https://vidly.sugamwtw.tech.app/)

## 🔗 Links

- Frontend Repository: [Vidly Frontend](https://github.com/SugamChaudharry/Vidly)
- Live Demo: [Vidly](https://vidly.sugamwtw.tech/)

## 🚀 Features

### Core Features

- User authentication and authorization
- Video upload and management
- Cloud storage integration with Cloudinary
- MongoDB database with Mongoose ODM
- JWT-based authentication
- File upload handling with Multer
- CORS enabled for cross-origin requests
- Environment variable configuration
- Development server with hot reload

## 🛠️ Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Bcrypt for password hashing
- **Storage**: Cloudinary for cloud storage
- **File Handling**: Multer for file uploads
- **API Security**: CORS for cross-origin resource sharing
- **Configuration**: Dotenv for environment variables
- **Development**: Nodemon for hot reloading

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Cloudinary account (for cloud storage)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/SugamChaudharry/Vidly_backend.git
cd Vidly_backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start the development server:

```bash
npm run dev
```

The server will start running on the specified PORT (default: 8000).

## 📁 Project Structure

```
Vidly_backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   │   ├── video.model.js
│   │   ├── user.model.js
│   │   ├── watchHistory.model.js
│   │   ├── userPreferences.model.js
│   │   ├── playlist.model.js
│   │   ├── comments.model.js
│   │   └── subscription.model.js
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   ├── app.js         # Express app configuration
│   └── index.js       # Application entry point
├── public/            # Static files
├── .env              # Environment variables
├── package.json      # Project dependencies
└── README.md         # Project documentation
```

## �� API Endpoints

### Health Check

- GET /api/v1/health - Check API health status

### Authentication & User Management

- POST /api/v1/users/register - Register a new user
- POST /api/v1/users/login - User login
- POST /api/v1/users/logout - User logout
- POST /api/v1/users/refresh-token - Refresh access token
- POST /api/v1/users/change-password - Change user password
- GET /api/v1/users/current-user - Get current user details
- PATCH /api/v1/users/update-Account-Details - Update user account details
- PATCH /api/v1/users/update-Avatar - Update user avatar
- PATCH /api/v1/users/update-CoverImage - Update user cover image
- GET /api/v1/users/channel/:userName - Get user channel profile
- GET /api/v1/users/history - Get user watch history

### Video Management

- GET /api/v1/videos - Get all videos
- POST /api/v1/videos - Upload a new video
- GET /api/v1/videos/:videoId - Get video by ID
- DELETE /api/v1/videos/:videoId - Delete video
- PATCH /api/v1/videos/:videoId - Update video
- PATCH /api/v1/videos/toggle/publish/:videoId - Toggle video publish status

### Comments

- GET /api/v1/comments/:videoId - Get video comments
- POST /api/v1/comments/:videoId - Add comment to video
- DELETE /api/v1/comments/c/:commentId - Delete comment
- PATCH /api/v1/comments/c/:commentId - Update comment

### Likes

- POST /api/v1/likes/toggle/v/:videoId - Toggle video like
- GET /api/v1/likes/video/:videoId - Get video likes
- POST /api/v1/likes/toggle/c/:commentId - Toggle comment like
- POST /api/v1/likes/toggle/t/:tweetId - Toggle tweet like
- GET /api/v1/likes/videos - Get liked videos

### Playlists

- POST /api/v1/playlists - Create playlist
- GET /api/v1/playlists/:playlistId - Get playlist by ID
- PATCH /api/v1/playlists/:playlistId - Update playlist
- DELETE /api/v1/playlists/:playlistId - Delete playlist
- PATCH /api/v1/playlists/add/:videoId/:playlistId - Add video to playlist
- PATCH /api/v1/playlists/remove/:videoId/:playlistId - Remove video from playlist
- GET /api/v1/playlists/user/:userId - Get user playlists

### Subscriptions

- GET /api/v1/subscriptions/c/:channelId - Get channel subscribers
- POST /api/v1/subscriptions/c/:channelId - Toggle channel subscription
- GET /api/v1/subscriptions/:channelId - Get video subscribers
- GET /api/v1/subscriptions - Get subscribed channels

### Tweets

- POST /api/v1/tweets - Create tweet
- GET /api/v1/tweets/user/:userId - Get user tweets
- PATCH /api/v1/tweets/:tweetId - Update tweet
- DELETE /api/v1/tweets/:tweetId - Delete tweet

### Dashboard

- GET /api/v1/dashboard/stats - Get channel statistics

## 👨‍💻 Author

- **Sugam Chaudhary**
  - GitHub: [@SugamChaudharry](https://github.com/SugamChaudharry)

## 🙏 Acknowledgments

- Special thanks to the open-source community for their amazing tools and libraries

## 📝 License

This project is licensed under the ISC License.
