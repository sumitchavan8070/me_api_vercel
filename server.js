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
// connectDB();

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


// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "SUMIT API IS CONNECTED to MeAdhikari",
//   });
// });



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
app.use("/api/v1/admin", cacheMiddleware, require("./routes/adminRoutes"));
app.use("/api/v1/admin",cacheMiddleware,  require("./routes/studentsTableBackedRoute"));
app.use("/api/v1/admin/donation", cacheMiddleware, require("./routes/donationRoutes"));
app.use("/api/v1/auth/donation",cacheMiddleware, require("./routes/donationRoutes"));

app.use("/api/v1/auth/posts",cacheMiddleware,  require("./routes/postRoutes"));
app.use("/api/v1/admin/posts", cacheMiddleware, require("./routes/postRoutes"));

app.use("/api/v1/auth/exam-categories", cacheMiddleware, require("./routes/examCategoryRoutes")); //DONE
app.use("/api/v1/auth/subcategories", cacheMiddleware, require("./routes/subExamTypeRoutes")); // Done
app.use("/api/v1/admin/subcategories", cacheMiddleware, require("./routes/subExamTypeRoutes")); // Done

app.use("/api/v1/auth/years", cacheMiddleware, require("./routes/examYearRoutes")); // Done , for frontend
app.use(
  "/api/v1/auth/question-papers",
  cacheMiddleware, require("./routes/questionPaperRoutes")
);
app.use(
  "/api/v1/admin/question-papers",
  cacheMiddleware, require("./routes/questionPaperRoutes")
);

app.use("/api/v1/auth/subjects",cacheMiddleware, require("./routes/subjectRoutes")); // Include subject routes

app.use("/api/v1/auth/groups", cacheMiddleware, require("./routes/groupRoutes"));

//leaderboard
app.use("/api/v1/auth/leaderboard", cacheMiddleware, require("./routes/leaderboardRoutes"));

app.use("/api/v1/auth/customtest",cacheMiddleware,  require("./routes/customTestRoutes"));

app.use("/api/v1/auth/papers", cacheMiddleware, require("./routes/allPaperRoutes"));
app.use("/api/v1/admin/papers", cacheMiddleware, require("./routes/allPaperRoutes"));

app.use("/api/v1/auth/feedback", cacheMiddleware, require("./routes/feedbackRoutes"));
app.use("/api/v1/admin/feedback", cacheMiddleware, require("./routes/feedbackRoutes"));

app.use("/api/v1/auth/abc", cacheMiddleware, require("./routes/examDetailWithYearRoute"));

//port
const PORT = process.env.PORT || 2020;

//listen
// app.listen(PORT, () => {
//   console.log(`Server is Running ${PORT}`.bgGreen.white);
// });

server.listen(PORT, () => {
  console.log(`Server is Running ${PORT}`);
});

// server added to vercel

app.get("/", (req, res) => {
  res.send("Api is running ready to start !");
  console.log("Root path accessed. Server is running.");
});
