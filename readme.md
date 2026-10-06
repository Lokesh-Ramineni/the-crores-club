# The Crores Club

A real-time, multiplayer IPL-style cricket player auction. Create a room,
invite friends, and bid live on a pool of players with a shared purse —
like a mock auction night, built as a web app. (The UI currently displays
the brand name **BidHouse** — the repo/project itself is The Crores Club.)

## Features

- **Rooms** — create a room with a code, configurable starting purse,
  per-player timer, and bid-extension rule; others join by code
- **Live auction** — real-time bidding over Socket.IO, soft-close timer
  (a bid with under 10s left extends the clock instead of a hard reset),
  Pass, and a host-only Force Skip
- **Live state for everyone in the room** — purse, squad size, players
  remaining, and other players' status (winning / passed / squad full)
  update live, not just for the person bidding
- **My Purchases** — a collapsible panel showing the squad you've bought
  and what you paid for each player
- **Signup via email OTP** — a 6-digit code (sent through Resend) verifies
  real email addresses before an account is created, with layered rate
  limiting (per-IP, per-email, and a global daily send cap) so the signup
  form can't be used to spam or exhaust the email quota
- **Google sign-in** — an alternative to OTP signup; verifies the account
  via Google's ID token and reuses an existing account by email if one
  already exists

## Tech stack

**Backend** — Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT
auth, bcrypt, Resend (transactional email), google-auth-library
(Google ID token verification), express-rate-limit.

**Frontend** — Plain HTML/CSS/JavaScript, no framework or build step.
Socket.IO client and Google Identity Services loaded via `<script>` tags.

## Project structure

```
backend/
  server.js              Express app + Socket.IO server
  config/db.js            MongoDB connection
  models/                 User, Room, Player, PendingSignup, EmailUsage
  controllers/            auth + room request handlers
  routes/                 /api/auth, /api/rooms
  sockets/auctionSocket.js  the live auction engine
  middleware/             JWT auth guard, OTP rate limiter
  utils/                  OTP email sending, daily email quota
  seed/                   scripts + data to load the player pool into Mongo

frontend/
  index.html               login / signup / OTP verification
  home.html, create_room.html, join_room.html, room_lobby.html
  auction_room.html         the live auction page
  players-list.html, auction-rules.html
  js/
    lobby/                  room-lobby page logic, split by concern
    auction_room/           auction-room page logic, split by concern
    auth.js, index.js, ...  one file per other page
  css/                      one stylesheet per page
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values below
npm run dev             # or: npm start
```

Required environment variables (see `.env.example` for the full list
with comments):

| Variable | What it's for |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs login tokens |
| `FRONTEND_URL` | Your deployed frontend's URL — used for CORS |
| `RESEND_API_KEY` | From resend.com — sends OTP emails |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` works with no setup; switch to an address on a domain you've verified in Resend once you have one |
| `MAX_DAILY_EMAILS` | Safety cap on OTP emails/day (defaults to 90, under Resend's free-tier 100/day limit) |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web Client ID from Google Cloud Console |

**Seeding the player pool** — the auction needs players in the database
before a room can start one:

```bash
cd backend/seed
node seed.js
```

### Frontend

The frontend is static files — serve them with anything (`npx serve`,
Render's static site hosting, etc.). Two values are hardcoded in the
JS (no build-time env injection, since there's no bundler) and need
to be set to match your backend before deploying:

- `frontend/js/auth.js` → `API_BASE_URL` — your backend's URL
- `frontend/js/index.js` → `GOOGLE_CLIENT_ID` — must match the backend's
  `.env` value exactly

### Google sign-in setup

1. Google Cloud Console → **APIs & Services → Credentials** → create an
   **OAuth 2.0 Client ID** (type: Web application)
2. Add your frontend's URL under **Authorized JavaScript origins** (no
   redirect URI needed — this flow doesn't use one)
3. Put that Client ID in both places listed above
4. While the OAuth consent screen is in **Testing** mode, only Google
   accounts added as test users can actually sign in — add your friends'
   emails there, or publish to Production when you're ready for anyone

## Live auction, in brief

The current state of an in-progress auction (current player, current
bid, timer, who's passed) lives in memory on the server
(`liveAuctionState` in `sockets/auctionSocket.js`) — not in MongoDB.
Key socket events: `auction:start`, `bid:place`, `bid:pass`,
`auction:forceSkip`, broadcasting `auction:currentPlayer`,
`auction:update`, `player:sold` / `player:unsold`, and `room:updated`
to keep every client's purse/squad/other-players view in sync.

## Known limitations

- **No restart persistence** — live auction state is in-memory only.
  A server restart mid-auction loses the current player/bid/timer
  (room, purse, and completed purchases are safe, since those are in
  MongoDB — only the in-progress round is affected)
- **Pause button is a stub** — not wired to anything yet
- **Resend sender** — until a domain is verified in Resend, OTP emails
  can only be sent to your own Resend account email, not arbitrary
  real users
- **Google OAuth app** — starts in Testing mode; only added test users
  can sign in until the app is published