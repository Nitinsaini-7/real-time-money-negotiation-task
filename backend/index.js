// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Import DB connection
const authRoutes = require("./routes/auth"); // Import auth routes
const authMiddleware = require("./middleware/auth"); // Import auth middleware for protecting Socket.IO events (optional, but good practice)
const NegotiationSession = require("./models/NegotiationSession"); // Assuming you'll move your session model here
const negotiationRoutes = require('./routes/negotiation')
dotenv.config(); // Load environment variables

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.FRONTEND_URL, // Allow your React app to connect
    methods: ["GET", "POST", "PUT"], // Add PUT for updates
  },
});
app.use(cors());
// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false })); // Allows us to get data in req.body

// Define Routes
app.use("/api/auth", authRoutes);
app.use('/api/negotiations', negotiationRoutes)

// --- Socket.IO Logic ---
// You can optionally add a middleware to Socket.IO for authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided."));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token."));
  }
});

io.on("connection", (socket) => {
  console.log(
    `User ${socket.user ? socket.user.id : "unauthenticated"} connected: ${
      socket.id
    }`
  );

  socket.on("joinSession", async ({ sessionId }) => {
    // Ensure the user joining is part of the session or authorized to join
    // You'd typically load the session from DB and check participants
    let session = await NegotiationSession.findOne({ sessionId });
    if (!session) {
      session = new NegotiationSession({
        sessionId,
        participants: [socket.user.id],
      });
      await session.save();
    } else if (!session.participants.includes(socket.user.id)) {
      session.participants.push(socket.user.id);
      await session.save();
    }

    socket.join(sessionId);
    console.log(`User ${socket.user.id} joined session ${sessionId}`);

    // Emit current offers from DB
    const populatedSession = await NegotiationSession.findOne({
      sessionId,
    }).populate("offers.offeredBy", "username"); // Populate username only

    io.to(sessionId).emit("currentOffers", populatedSession.offers);
  });

  socket.on("newOffer", async ({ sessionId, offerAmount }) => {
    try {
      const offer = {
        offerAmount: parseFloat(offerAmount),
        offeredBy: socket.user.id, // Use the authenticated user's ID
        status: "pending",
      };

      const session = await NegotiationSession.findOneAndUpdate(
        { sessionId },
        { $push: { offers: offer } },
        { new: true } // Return the updated document
      );

      if (session) {
        io.to(sessionId).emit("offerUpdate", session.offers);
      } else {
        socket.emit("error", "Session not found.");
      }
    } catch (err) {
      console.error(err);
      socket.emit("error", "Failed to submit offer.");
    }
  });

  socket.on("acceptOffer", async ({ sessionId, offerId }) => {
    try {
      const session = await NegotiationSession.findOne({ sessionId });
      if (!session) {
        return socket.emit("error", "Session not found.");
      }

      const offer = session.offers.id(offerId); // Mongoose subdocument .id() method
      if (!offer) {
        return socket.emit("error", "Offer not found.");
      }

      if (offer.status !== "pending") {
        return socket.emit("error", "Offer already processed.");
      }

      // You might want to add logic here to ensure only the recipient can accept
      // For now, any participant can accept.
      offer.status = "accepted";
      session.status = "completed"; // Mark session as completed
      await session.save();

      io.to(sessionId).emit("offerUpdate", session.offers);
      io.to(sessionId).emit("negotiationEnded", {
        acceptedOffer: offer,
        byUser: socket.user.username,
      });
    } catch (err) {
      console.error(err);
      socket.emit("error", "Failed to accept offer.");
    }
  });

  socket.on("declineOffer", async ({ sessionId, offerId }) => {
    try {
      const session = await NegotiationSession.findOne({ sessionId });
      if (!session) {
        return socket.emit("error", "Session not found.");
      }

      const offer = session.offers.id(offerId);
      if (!offer) {
        return socket.emit("error", "Offer not found.");
      }

      if (offer.status !== "pending") {
        return socket.emit("error", "Offer already processed.");
      }

      offer.status = "declined";
      await session.save();

      io.to(sessionId).emit("offerUpdate", session.offers);
    } catch (err) {
      console.error(err);
      socket.emit("error", "Failed to decline offer.");
    }
  });

  socket.on("disconnect", () => {
    console.log(
      `User ${socket.user ? socket.user.id : "unauthenticated"} disconnected: ${
        socket.id
      }`
    );
    // Consider removing users from active sessions if they are the last one, etc.
  });
});

app.get("/", (req, res) => {
  res.send("api...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
