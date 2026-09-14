const express = require("express");
const cors = require("cors");

const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const roomRoutes=require("./routes/room")
const app = express();  

app.use(cors({
    origin:[ "http://localhost:50555",
    "http://10.151.73.123:50555"]
}));

app.use(express.json());

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/rooms",roomRoutes)
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});