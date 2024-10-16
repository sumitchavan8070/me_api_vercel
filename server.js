const { Server } = require("socket.io");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const server = http.createServer(app);
const chatSocket = require("./Socket/chatSocket");

const cron = require("node-cron");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600 });

const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//dotenv
dotenv.config();

//database connection
connectDB();

//Rest Object

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    console.log(`Cache hit for ${key}`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(cachedResponse);
  }

  console.log(`Cache miss for ${key}`);
  res.originalSend = res.send;
  res.send = (body) => {
    cache.set(key, body);
    console.log(`Cache set for ${key}`);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.originalSend(body);
  };
  next();
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});



//middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

//routes
// defalut route

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MeAdhikari",
  });
});



app.get("/api/clearCache", (req, res) => {
  console.log("Cache cleared successfully");
  cache.flushAll();
  res.send("Cache cleared successfully");
});


cron.schedule("0 */12 * * *", () => {
  console.log("Clearing specific cache keys every 12 hours");
  cache.flushAll();
});

chatSocket(io);

//custome route
app.use("/api/v1/auth", cacheMiddleware, require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/admin", require("./routes/studentsTableBackedRoute"));
app.use("/api/v1/admin/donation", require("./routes/donationRoutes"));
app.use("/api/v1/auth/donation", require("./routes/donationRoutes"));

app.use("/api/v1/auth/posts", require("./routes/postRoutes"));
app.use("/api/v1/admin/posts", require("./routes/postRoutes"));

app.use("/api/v1/auth/exam-categories", require("./routes/examCategoryRoutes")); //DONE
app.use("/api/v1/auth/subcategories", require("./routes/subExamTypeRoutes")); // Done
app.use("/api/v1/admin/subcategories", require("./routes/subExamTypeRoutes")); // Done

app.use("/api/v1/auth/years", require("./routes/examYearRoutes")); // Done , for frontend
app.use(
  "/api/v1/auth/question-papers",
  require("./routes/questionPaperRoutes")
);
app.use(
  "/api/v1/admin/question-papers",
  require("./routes/questionPaperRoutes")
);

app.use("/api/v1/auth/subjects", require("./routes/subjectRoutes")); // Include subject routes

app.use("/api/v1/auth/groups", require("./routes/groupRoutes"));

//leaderboard
app.use("/api/v1/auth/leaderboard", require("./routes/leaderboardRoutes"));

app.use("/api/v1/auth/customtest", require("./routes/customTestRoutes"));

app.use("/api/v1/auth/papers", require("./routes/allPaperRoutes"));
app.use("/api/v1/admin/papers", require("./routes/allPaperRoutes"));

app.use("/api/v1/auth/feedback", require("./routes/feedbackRoutes"));
app.use("/api/v1/admin/feedback", require("./routes/feedbackRoutes"));

app.use("/api/v1/auth/abc", require("./routes/examDetailWithYearRoute"));

//port
const PORT = process.env.PORT || 2020;

//listen
// app.listen(PORT, () => {
//   console.log(`Server is Running ${PORT}`.bgGreen.white);
// });

server.listen(PORT, () => {
  console.log(`Server is Running ${PORT}`.bgGreen.white);
});

// server added to vercel

// app.get("/", (req, res) => {
//   res.send("Server is running!");
//   console.log("Root path accessed. Server is running.".bgGreen.white);
// });
