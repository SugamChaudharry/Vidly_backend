import mongoose, { Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface PlaylistDoc extends Document {
  owner: Types.ObjectId;
  description: string;
  playlistName: string;
  videos: Types.ObjectId[];
}

const playlistSchema = new Schema<PlaylistDoc>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
    playlistName: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

playlistSchema.plugin(mongooseAggregatePaginate);

export const Playlist = mongoose.model<PlaylistDoc>("Playlist", playlistSchema);
