const mongoose = require("mongoose");

// ============================================================
// PARTICIPANT SCHEMA
// ============================================================

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    purseRemaining: {
      type: Number,
      required: true,
      min: 0,
    },

    squad: [
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
        price: {
          type: Number,
        },
      },
    ],
  },
  {
    _id: false,
  }
);

// ============================================================
// ROOM SCHEMA
// ============================================================

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Room code is required"],
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },

    type: {
      type: String,
      enum: ["public", "private"],
      required: true,
      default: "public",
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Host ID is required"],
    },

    settings: {
      // Maximum number of people allowed in the room
      maxPlayers: {
        type: Number,
        required: true,
        default: 4,
        min: [2, "Room must allow at least 2 players"],
        max: [10, "Room cannot have more than 10 players"],
      },

      startingPurse: {
        type: Number,
        required: true,
        default: 1000000000,
        min: [0, "Starting purse cannot be negative"],
      },

      timerPerPlayer: {
        type: Number,
        required: true,
        default: 30,
        min: [5, "Timer must be at least 5 seconds"],
      },

      bidExtension: {
        type: Number,
        required: true,
        default: 5,
        min: [0, "Bid extension cannot be negative"],
      },

      extensionThreshold: {
        type: Number,
        required: true,
        default: 5,
        min: [0, "Extension threshold cannot be negative"],
      },
    },

    participants: [participantSchema],

    status: {
      type: String,
      enum: [
        "waiting",
        "live",
        "completed",
      ],
      default: "waiting",
    },


    currentAuction: {
      // Player currently being auctioned
      playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        default: null,
      },

      // Current highest bid
      currentBid: {
        type: Number,
        default: 0,
        min: 0,
      },

      // User who currently has the highest bid
      highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      // Current auction state
      status: {
        type: String,
        enum: [
          "idle",
          "bidding",
          "sold",
          "unsold",
        ],
        default: "idle",
      },

      // Exact time at which auction ends
      // Server should use this for the timer
      endsAt: {
        type: Date,
        default: null,
      },

      // Number of extensions that happened
      extensions: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // ----------------------------------------------------------
    // AUCTION PROGRESS
    // ----------------------------------------------------------

    // Index of the next player to auction
    currentPlayerIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Players that have already been auctioned
    auctionedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],
  },

  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;