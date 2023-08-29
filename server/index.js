const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const authRouter = require("./routes/auth.routes");

const app = express();
const PORT = config.get("serverPort");
const DBURL = config.get("dbURL");

app.use(express.json());
app.use("/api/auth", authRouter);

const start = async () => {
  try {
    await mongoose.connect(DBURL);
    app.listen(PORT, () => {
      console.log(`Сервер запущен ${PORT}--- бд подлючено ${DBURL}`);
      console.log("pid", process.pid);
    });
  } catch (error) {
    console.log("Ошибка", error);
  }
};

start();
