const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes");
const fileRouter = require("./routes/file.routes");

const app = express();
const PORT = config.get("serverPort");
const DBURL = config.get("dbURL");
const staticFiles = config.get("staticPath");
const corsMiddleware = require("./middleware/cors.middleware");

app.use(fileUpload({}))
app.use(corsMiddleware);
app.use(express.json());
app.use(express.static(staticFiles))
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);

const start = async () => {
  try {
    await mongoose.connect(DBURL);
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`бд подлючено ${DBURL}`);
      console.log("pid", process.pid);
    });
  } catch (error) {
    console.log("Ошибка", error);
  }
};

start();
